class LoggerService {
  constructor() {
    this.conversationLogs = [];
    this.auditLogs = [];
    this.seedInitialLogs();
  }

  seedInitialLogs() {
    this.auditLogs.push(
      {
        id: 'log_audit_101',
        type: 'SYSTEM_STARTUP',
        userId: 'usr_admin',
        userName: 'Sarah Connor',
        userRole: 'Admin',
        details: 'Nexus Knowledge Hub backend initialized with Pinecone vector index adapter and Nodemailer SMTP engine.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'log_audit_102',
        type: 'SECURITY_RBAC_CHECK',
        userId: 'usr_employee',
        userName: 'John Doe',
        userRole: 'Employee',
        details: 'Attempted access to Q1 Executive Compensation policy. RBAC Guard blocked 1 restricted document chunk.',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    );

    this.conversationLogs.push(
      {
        id: 'chat_log_201',
        query: 'What is our annual leave entitlement for 2026?',
        userId: 'usr_employee',
        userName: 'John Doe',
        userRole: 'Employee',
        answer: 'Full-time employees receive 22 working days of paid annual leave per calendar year.',
        citedDocuments: ['doc_hr_leave_2026'],
        latencyMs: 142,
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString()
      }
    );
  }

  logConversation(entry) {
    const log = {
      id: `chat_log_${Date.now()}`,
      query: entry.query,
      userId: entry.userId || 'usr_anonymous',
      userName: entry.userName || 'Employee',
      userRole: entry.userRole || 'Employee',
      answer: entry.answer,
      citedDocuments: entry.citations ? entry.citations.map(c => c.title) : [],
      filteredOutDueToRBAC: entry.filteredOutDueToRBAC || 0,
      latencyMs: entry.latencyMs,
      timestamp: entry.timestamp || new Date().toISOString()
    };

    this.conversationLogs.unshift(log);
    return log;
  }

  logAudit(type, user, details) {
    const log = {
      id: `log_audit_${Date.now()}`,
      type,
      userId: user?.id || 'system',
      userName: user?.name || 'System Auto',
      userRole: user?.role || 'System',
      details,
      timestamp: new Date().toISOString()
    };

    this.auditLogs.unshift(log);
    return log;
  }

  getConversationLogs() {
    return this.conversationLogs;
  }

  getAuditLogs() {
    return this.auditLogs;
  }
}

export const loggerService = new LoggerService();
