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

  // Strict Membership Guard: Reject unregistered emails
  const existingUser = initialUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (!existingUser) {
    loggerService.logAudit(
      'SECURITY_ALERT',
      { email: cleanEmail },
      `Access Denied: Attempted login by unregistered email '${cleanEmail}'`
    );

    return res.status(403).json({
      success: false,
      message: `Invalid Email: '${cleanEmail}' is not a registered member of this company. Access is restricted to onboarded employees only. Please contact Admin or HR to get provisioned.`
    });
  }

  try {
    // Generate 6-digit OTP
    const otpCode = otpService.generateOTP(cleanEmail);

    // Dispatch OTP email via Nodemailer / Gmail SMTP
    const emailResult = await emailService.sendOTPEmail({ to: cleanEmail, otpCode });

    loggerService.logAudit(
      'OTP_DISPATCHED',
      { email: cleanEmail },
      `6-digit verification code sent to ${cleanEmail}.`
    );

    if (emailResult && emailResult.status === 'FAILED') {
      console.error(`[AuthRoutes] SMTP delivery failed for '${cleanEmail}':`, emailResult.errorMessage);
      return res.status(500).json({
        success: false,
        message: `Failed to deliver email via Gmail SMTP (${emailResult.errorMessage}). Please ensure a valid Gmail App Password is configured in backend/.env.`
      });
    }

    res.json({
      success: true,
      message: `A 6-digit verification OTP code has been dispatched to '${cleanEmail}'. Please check your inbox.`
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

  // Strict Membership Guard: Reject unregistered emails
  let user = initialUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    loggerService.logAudit(
      'SECURITY_ALERT',
      { email: cleanEmail },
      `Access Denied: OTP verification attempted for unregistered email '${cleanEmail}'`
    );

    return res.status(403).json({
      success: false,
      message: `Invalid Email: '${cleanEmail}' is not a registered member of this company.`
    });
  }

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

  // OTP is Valid! Activate employee account upon successful OTP verification
  user.emailVerified = true;
  if (user.status === 'Pending OTP Verification') {
    user.status = 'Active';
  }

  // Status Guard Check: Block Suspended & Resigned Accounts
  if (user.status === 'Suspended' || user.status === 'Resigned') {
    loggerService.logAudit(
      'SECURITY_ALERT',
      user,
      `Access Denied: Attempted login by ${user.status} account '${user.email}'`
    );
    return res.status(403).json({
      success: false,
      message: `Access Denied: Account '${user.email}' is currently marked as '${user.status}'. Login is restricted by Corporate Security.`
    });
  }

  // Issue Security Clearance JWT Token
  const token = jwt.sign(
    { 
      id: user.id, 
      employeeId: user.employeeId, 
      name: user.name, 
      role: user.role, 
      email: user.email, 
      securityClearance: user.securityClearance || 'Level 1',
      department: user.department 
    },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  loggerService.logAudit(
    'USER_LOGIN_OTP_VERIFIED',
    user,
    `Employee '${user.name}' (${user.securityClearance || 'Level 1'}) verified email ownership and logged in.`
  );

  res.json({
    success: true,
    user,
    token,
    message: `Verification Successful: Welcome ${user.name}!`
  });
});

// Get list of active & registered enterprise users
router.get('/users', (req, res) => {
  res.json({ success: true, users: initialUsers });
});

// Login & Employee Verification Endpoint
router.post('/login', (req, res) => {
  const { userId, email, password } = req.body;

  let user = null;

  // Search in registered company directory by ID or Email
  if (userId) {
    user = initialUsers.find(u => u.id === userId);
  } else if (email) {
    const cleanEmail = email.trim().toLowerCase();
    user = initialUsers.find(u => u.email.toLowerCase() === cleanEmail);
  }

  // Verification Failed - Deny Access to unregistered personnel
  if (!user) {
    const attemptedEmail = email || userId || 'unknown';
    loggerService.logAudit(
      'SECURITY_ALERT', 
      { id: 'unauthorized', name: attemptedEmail, role: 'Unverified External' }, 
      `Access Denied: Attempted login with non-member credentials (${attemptedEmail})`
    );

    return res.status(401).json({
      success: false,
      message: `Invalid Email: '${attemptedEmail}' is not a registered member of this company. Only authorized members added by Admin/HR can use this website.`
    });
  }

  // 4. Status Guard Check: Block Suspended & Resigned Accounts
  if (user.status === 'Suspended' || user.status === 'Resigned') {
    loggerService.logAudit(
      'SECURITY_ALERT',
      user,
      `Access Denied: Attempted login by ${user.status} account '${user.email}'`
    );
    return res.status(403).json({
      success: false,
      message: `Access Denied: Account '${user.email}' is currently marked as '${user.status}'. Login is restricted by Corporate Security.`
    });
  }

  // 5. Verification Successful - Issue Security Clearance JWT Token
  const token = jwt.sign(
    { 
      id: user.id, 
      employeeId: user.employeeId, 
      name: user.name, 
      role: user.role, 
      email: user.email,
      securityClearance: user.securityClearance || 'Level 1',
      department: user.department 
    },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  loggerService.logAudit('USER_LOGIN', user, `Employee Verified: ${user.name} logged in with ${user.role} (${user.securityClearance || 'Level 1'}) clearance.`);

  res.json({
    success: true,
    user,
    token,
    message: `Verification Successful: Welcome ${user.name}!`
  });
});

// Admin / HR Onboarding - Provision new employee with full 11-field enterprise schema
router.post('/users/add', async (req, res) => {
  const { 
    employeeId,
    fullName,
    name, 
    email, 
    phone,
    department, 
    designation,
    role, 
    securityClearance,
    dateOfJoining,
    status,
    profilePhoto,
    requesterRole 
  } = req.body;

  // Enforce Admin / HR authorization check
  if (requesterRole === 'Employee' || (requesterRole && requesterRole !== 'Admin' && requesterRole !== 'HR Manager')) {
    loggerService.logAudit('SECURITY_ALERT', { name: 'User', role: requesterRole }, `Access Denied: Attempted employee onboarding without Admin/HR clearance.`);
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Only Admin and HR Lead personnel are authorized to onboard new employees into the company directory.'
    });
  }

  const employeeName = fullName || name;
  if (!employeeName || !email) {
    return res.status(400).json({ success: false, message: 'Full Name and company email are required fields.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Check if email already exists
  const existing = initialUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ success: false, message: `Employee with email '${cleanEmail}' is already registered.` });
  }

  const generatedId = `EMP${String(initialUsers.length + 1).padStart(3, '0')}`;

  const newEmployee = {
    id: `usr_${Date.now()}`,
    employeeId: employeeId || generatedId,
    email: cleanEmail,
    name: employeeName.trim(),
    fullName: employeeName.trim(),
    phone: phone || '+1 (555) 019-0000',
    department: department || 'Operations',
    designation: designation || 'Staff Associate',
    role: role || 'Employee',
    securityClearance: securityClearance || 'Level 1',
    dateOfJoining: dateOfJoining || new Date().toISOString().split('T')[0],
    status: status || 'Active',
    emailVerified: false, // Requires OTP email verification
    createdBy: requesterRole || 'Admin System',
    avatar: profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };

  initialUsers.unshift(newEmployee);

  // Trigger 6-digit verification code to employee email
  let generatedOtp = '123456';
  try {
    generatedOtp = otpService.generateOTP(cleanEmail);
    await emailService.sendOTPEmail({ to: cleanEmail, otpCode: generatedOtp });
  } catch (err) {
    console.warn('[AuthRoutes] Non-fatal: OTP dispatch error during onboarding:', err.message);
  }

  loggerService.logAudit(
    'EMPLOYEE_ONBOARDED', 
    newEmployee, 
    `Admin/HR created employee '${newEmployee.name}' (${newEmployee.employeeId}) with ${newEmployee.securityClearance} in '${newEmployee.department}'.`
  );

  res.json({
    success: true,
    message: `Employee '${newEmployee.name}' (${newEmployee.employeeId}) provisioned. 6-digit OTP verification code sent to ${cleanEmail}. Verify OTP to activate member account.`,
    user: newEmployee,
    otpCode: generatedOtp,
    users: initialUsers
  });
});

// Admin / HR Onboarding OTP Verification Endpoint
router.post('/users/verify-onboarding-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Email address and 6-digit OTP code are required.'
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  let user = initialUsers.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: `Employee with email '${cleanEmail}' not found in directory.`
    });
  }

  const otpResult = otpService.verifyOTP(cleanEmail, otp);
  if (!otpResult.valid) {
    return res.status(400).json({
      success: false,
      message: otpResult.message
    });
  }

  // Activate employee account
  user.emailVerified = true;
  user.status = 'Active';

  loggerService.logAudit(
    'EMPLOYEE_ONBOARDING_OTP_VERIFIED',
    user,
    `Onboarding OTP verified for '${user.name}' (${user.email}). Member account activated.`
  );

  res.json({
    success: true,
    message: `✅ Member Account Verified & Activated! Employee '${user.name}' can now log in to the website.`,
    user,
    users: initialUsers
  });
});

export default router;
