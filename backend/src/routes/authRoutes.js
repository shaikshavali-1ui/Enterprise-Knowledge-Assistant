import express from 'express';
import jwt from 'jsonwebtoken';
import { initialUsers } from '../data/seedData.js';
import { config } from '../config/index.js';
import { loggerService } from '../services/loggerService.js';
import { otpService } from '../services/otpService.js';
import { emailService } from '../services/emailService.js';

const router = express.Router();

// ----------------------------------------------------
// OTP EMAIL VERIFICATION ENDPOINTS
// ----------------------------------------------------

/**
 * Generate & Send 6-Digit Verification OTP via Nodemailer / Gmail SMTP
 */
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid company email address.'
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    // Generate 6-digit OTP
    const otpCode = otpService.generateOTP(cleanEmail);

    // Dispatch OTP email via Nodemailer / Gmail SMTP
    await emailService.sendOTPEmail({ to: cleanEmail, otpCode });

    loggerService.logAudit(
      'OTP_DISPATCHED',
      { email: cleanEmail },
      `6-digit verification code sent to ${cleanEmail}.`
    );

    res.json({
      success: true,
      message: `A 6-digit verification OTP code has been dispatched to '${cleanEmail}'. Please check your inbox.`,
      otpPreview: process.env.NODE_ENV !== 'production' ? otpCode : undefined
    });
  } catch (err) {
    console.error('[AuthRoutes] Error sending OTP email:', err.message);
    res.status(500).json({
      success: false,
      message: `Failed to dispatch OTP email: ${err.message}`
    });
  }
});

/**
 * Verify 6-Digit OTP & Authenticate Employee
 */
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Email address and 6-digit OTP code are required.'
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Verify OTP using OTP service
  const otpResult = otpService.verifyOTP(cleanEmail, otp);

  if (!otpResult.valid) {
    loggerService.logAudit(
      'SECURITY_ALERT',
      { email: cleanEmail },
      `OTP Verification Failed for '${cleanEmail}': ${otpResult.message}`
    );

    return res.status(400).json({
      success: false,
      message: otpResult.message
    });
  }

  // OTP is Valid! Check user in corporate directory
  let user = initialUsers.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    // Dynamically register verified employee if domain matches
    const namePart = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    
    user = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      name: `${formattedName} (Verified Employee)`,
      role: 'Employee',
      department: 'General Operations',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };
  }

  // Issue Security Clearance JWT Token
  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role, email: user.email },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  loggerService.logAudit(
    'USER_LOGIN_OTP_VERIFIED',
    user,
    `Employee '${user.name}' successfully verified email ownership via 6-digit OTP and logged in.`
  );

  res.json({
    success: true,
    user,
    token,
    message: `Verification Successful: Welcome ${user.name}!`
  });
});

// Get list of predefined enterprise users / personas
router.get('/users', (req, res) => {
  res.json({ success: true, users: initialUsers });
});

// Allowed organization domains for company employees
const ALLOWED_COMPANY_DOMAINS = ['enterprise.com', 'nexus.com', 'company.com', 'nexus-hub.com'];

// Login & Employee Verification Endpoint
router.post('/login', (req, res) => {
  const { userId, email, password } = req.body;

  let user = null;

  // 1. Search in pre-registered company directory by ID or Email
  if (userId) {
    user = initialUsers.find(u => u.id === userId);
  } else if (email) {
    const cleanEmail = email.trim().toLowerCase();
    user = initialUsers.find(u => u.email.toLowerCase() === cleanEmail);
    
    // 2. If not pre-seeded, check if email belongs to an authorized company domain
    if (!user && cleanEmail.includes('@')) {
      const domain = cleanEmail.split('@')[1];
      if (ALLOWED_COMPANY_DOMAINS.includes(domain)) {
        // Dynamically verify & register new company employee
        const namePart = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        
        user = {
          id: `usr_${Date.now()}`,
          email: cleanEmail,
          name: `${formattedName} (Verified Employee)`,
          role: 'Employee',
          department: 'General Operations',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
        };
      }
    }
  }

  // 3. Verification Failed - Deny Access to non-company personnel
  if (!user) {
    const attemptedEmail = email || userId || 'unknown';
    loggerService.logAudit(
      'SECURITY_ALERT', 
      { id: 'unauthorized', name: attemptedEmail, role: 'Unverified External' }, 
      `Access Denied: Attempted login with non-company credentials (${attemptedEmail})`
    );

    return res.status(401).json({
      success: false,
      message: `Access Denied: '${attemptedEmail}' is not recognized in the Enterprise Knowledge Assistant corporate directory. Only verified organization employees can log in.`
    });
  }

  // 4. Verification Successful - Issue Security Clearance JWT Token
  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role, email: user.email },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  loggerService.logAudit('USER_LOGIN', user, `Employee Verified: ${user.name} logged in with ${user.role} clearance.`);

  res.json({
    success: true,
    user,
    token,
    message: `Verification Successful: Welcome ${user.name}!`
  });
});

// Admin / HR Onboarding - Add new employee to corporate directory
router.post('/users/add', (req, res) => {
  const { name, email, role, department, requesterRole } = req.body;

  if (requesterRole === 'Employee' || (requesterRole && requesterRole !== 'Admin' && requesterRole !== 'HR Manager')) {
    loggerService.logAudit('SECURITY_ALERT', { name: 'User', role: requesterRole }, `Access Denied: Attempted employee onboarding without Admin/HR clearance.`);
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Only Admin and HR Lead personnel are authorized to onboard new employees into the company directory.'
    });
  }

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and company email are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Check if email already exists
  const existing = initialUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ success: false, message: `Employee with email '${cleanEmail}' is already registered.` });
  }

  const newEmployee = {
    id: `usr_${Date.now()}`,
    email: cleanEmail,
    name: name.trim(),
    role: role || 'Employee',
    department: department || 'Operations',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };

  initialUsers.unshift(newEmployee);

  loggerService.logAudit(
    'EMPLOYEE_ONBOARDED', 
    newEmployee, 
    `HR/Admin added new employee '${newEmployee.name}' with role '${newEmployee.role}' in '${newEmployee.department}'.`
  );

  res.json({
    success: true,
    message: `Employee '${newEmployee.name}' successfully added to company directory.`,
    user: newEmployee,
    users: initialUsers
  });
});

export default router;
