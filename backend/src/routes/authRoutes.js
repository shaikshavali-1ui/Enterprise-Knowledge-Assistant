import express from 'express';
import jwt from 'jsonwebtoken';
import { initialUsers } from '../data/seedData.js';
import { config } from '../config/index.js';
import { loggerService } from '../services/loggerService.js';

const router = express.Router();

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
      message: `Access Denied: '${attemptedEmail}' is not recognized in the Nexus Knowledge Hub corporate directory. Only verified organization employees can log in.`
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
