export const initialUsers = [
  {
    id: 'usr_admin',
    email: 'admin@enterprise.com',
    name: 'Sarah Connor (System Admin)',
    role: 'Admin',
    department: 'Executive Management',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_hr',
    email: 'hr.manager@enterprise.com',
    name: 'Elena Rostova (HR Lead)',
    role: 'HR Manager',
    department: 'Human Resources',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_finance',
    email: 'finance.lead@enterprise.com',
    name: 'Marcus Vance (Finance Director)',
    role: 'Finance',
    department: 'Finance & Payroll',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_employee',
    email: 'dev.john@enterprise.com',
    name: 'John Doe (Software Engineer)',
    role: 'Employee',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  }
];

export const initialDocuments = [
  {
    id: 'doc_hr_leave_2026',
    title: 'Enterprise Annual Leave & Paid Time Off (PTO) Policy 2026',
    category: 'HR Policy',
    accessRole: 'Public', // All employees can read
    author: 'Elena Rostova',
    updatedAt: '2026-01-15',
    summary: 'Comprehensive policy detailing paid vacation, sick leave entitlements, parental leave, and approval workflows.',
    content: `SECTION 1: ANNUAL LEAVE ENTITLEMENT
Full-time employees are entitled to 22 working days of paid annual leave per calendar year. Leave accrues at a rate of 1.83 days per completed month of service.

SECTION 2: LEAVE REQUEST & APPROVAL WORKFLOW
1. Employees must submit leave requests via the Enterprise HR Portal at least 10 working days prior to planned vacation exceeding 3 consecutive days.
2. Direct Managers must review and approve or reject leave requests within 3 business days of submission.
3. Automated Email Notifications: Once approved by the manager, an automated email notification is generated and dispatched to HR Payroll and the employee containing the approval reference code.

SECTION 3: SICK LEAVE & EMERGENCY ABSENCE
Employees are allocated 10 days of fully paid sick leave annually. Medical certificates are mandatory for any sick leave exceeding 2 consecutive working days.

SECTION 4: MATERNITY & PATERNITY LEAVE
Maternity leave is granted up to 16 fully paid weeks. Paternity / Secondary Caregiver leave is granted for 4 fully paid weeks upon birth or legal adoption of a child.`
  },
  {
    id: 'doc_onboarding_guide',
    title: 'New Hire Employee Onboarding & Workplace Setup Manual',
    category: 'Onboarding',
    accessRole: 'Public',
    author: 'HR Operations',
    updatedAt: '2026-02-01',
    summary: 'Step-by-step onboarding guide for newly hired personnel, IT equipment issuance, and week-1 orientation checklist.',
    content: `SECTION 1: DAY 1 ORIENTATION & WELCOME
- 09:00 AM: Check-in at main reception / Join virtual orientation call with HR representative.
- 10:00 AM: IT Credential Setup - Receive hardware (MacBook Pro / ThinkPad), SSO login credentials, and YubiKey 2FA token.
- 11:30 AM: Enterprise Security Briefing & NDA Verification.

SECTION 2: AUTOMATED WELCOME EMAIL & SETUP PROTOCOL
Upon completion of HR documentation, HR admins trigger the Automated Onboarding Email Sequence via Nexus Knowledge Hub.
The email includes:
- Corporate email credentials & Slack workspace invitation link.
- Assigned mentor contact information.
- Direct manager meet-and-greet schedule.

SECTION 3: HARDWARE & SOFTWARE PROVISIONING POLICY
All employees are provided a hardware stipend of $500 for ergonomic office equipment setup. Company laptops must have BitLocker/FileVault encryption enabled and SentinelOne Endpoint Protection active at all times.`
  },
  {
    id: 'doc_it_security_2026',
    title: 'Global Cybersecurity & Information Protection Guidelines',
    category: 'IT Security',
    accessRole: 'Public',
    author: 'Chief Information Security Officer',
    updatedAt: '2026-03-10',
    summary: 'Rules on password safety, remote access via VPN, phishing prevention, and data security standards.',
    content: `SECTION 1: PASSWORD & MULTI-FACTOR AUTHENTICATION (MFA)
Passwords must be at least 16 characters in length, comprising uppercase, lowercase, numbers, and special symbols. Passwords expire every 90 days. MFA (Hardware key or Authenticator App) is strictly mandatory for all internal services.

SECTION 2: REMOTE ACCESS & VPN MANDATE
Accessing internal confidential repositories, databases, or RAG documentation servers from outside company network requires active connection through enterprise ZTNA (Zero Trust Network Access) / Cisco AnyConnect VPN.

SECTION 3: INCIDENT RESPONSE & SUSPICIOUS EMAILS
Any suspicious incoming emails or potential security breaches must be immediately reported to security-alert@enterprise.com or flagged via the Security Incident Bot.`
  },
  {
    id: 'doc_exec_comp_confidential',
    title: 'Q1 2026 Executive Compensation & Performance Incentive Structure',
    category: 'Executive Finance',
    accessRole: 'Executive-Only', // Restricted to Admin & HR Manager & Finance
    author: 'Board of Directors & Compensation Committee',
    updatedAt: '2026-04-05',
    summary: 'CONFIDENTIAL: Salary benchmark bands, executive bonus multipliers, stock option vesting schedules for senior leadership.',
    content: `[CONFIDENTIAL - RESTRICTED ACCESS]

SECTION 1: EXECUTIVE SALARY BANDS (LEVEL L7 - L9)
- L7 (Director): Base Range $210,000 - $275,000 | Target Bonus: 30% | Equity Grant: 15,000 RSUs (4-year vesting, 1-year cliff).
- L8 (VP): Base Range $290,000 - $380,000 | Target Bonus: 45% | Equity Grant: 40,000 RSUs.
- L9 (C-Suite): Base Range $420,000 - $600,000 | Target Bonus: 60% | Equity Grant: 100,000 RSUs.

SECTION 2: PERFORMANCE MULTIPLIER CRITERIA
Bonus payouts are tied to 60% corporate ARR growth and 40% department KPI milestone achievement. HR Payroll must execute payout calculations on the 15th of the month following Q1 close.`
  },
  {
    id: 'doc_hr_disciplinary_confidential',
    title: 'Internal Workplace Conduct & Investigation Standard Operating Procedure',
    category: 'HR Confidential',
    accessRole: 'HR-Only', // Restricted to Admin & HR Manager
    author: 'Elena Rostova',
    updatedAt: '2026-05-12',
    summary: 'CONFIDENTIAL: Procedures for handling employee grievances, formal warnings, performance improvement plans (PIP), and severance protocols.',
    content: `[CONFIDENTIAL - HR INTERNAL USE ONLY]

SECTION 1: GRIEVANCE HANDLING & INVESTIGATION PROTOCOL
All employee complaints regarding discrimination, harassment, or policy violations must be logged in the HR Secure Vault within 24 hours of receipt. An impartial investigator from HR Legal must be assigned within 48 hours.

SECTION 2: PERFORMANCE IMPROVEMENT PLAN (PIP) GUIDELINES
1. Step 1: Formal Verbal Counseling (Documented in HR File).
2. Step 2: 30-Day PIP Written Agreement with quantifiable goals.
3. Step 3: Bi-weekly progress reviews. If goals are not achieved at day 30, HR approval is required for separation.

SECTION 3: AUTOMATED TERMINATION & SEVERANCE NOTIFICATION EMAIL
Upon authorization by HR Director, HR Admins generate the confidential Severance Package & Offboarding Notice via the Email Automation Console.`
  }
];
