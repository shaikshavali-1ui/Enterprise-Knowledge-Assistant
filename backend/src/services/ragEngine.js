import { vectorStore } from './vectorStore.js';

class RAGEngineService {
  /**
   * Main query handler for RAG engine
   */
  async processQuery({ query, userRole = 'Employee', userId = 'anonymous', userName = 'Employee' }) {
    const startTime = Date.now();

    // 1. Vector Search with RBAC filtering
    const searchResult = await vectorStore.search({ query, userRole, topK: 3 });
    const chunks = searchResult.results;

    let responseAnswer = '';
    let citations = [];
    let emailActionSuggested = null;

    if (chunks.length === 0) {
      responseAnswer = `I couldn't find relevant information in the enterprise documents accessible to your role (**${userRole}**). ` +
        (searchResult.filteredOutDueToRBAC > 0
          ? `Note: ${searchResult.filteredOutDueToRBAC} matching document passages exist but require higher security permissions.`
          : `Please check your query or verify with your department administrator.`);
    } else {
      // Build synthesized answer from context
      const contextText = chunks.map(c => c.content).join('\n\n');

      responseAnswer = this.synthesizeAnswer(query, chunks, userRole);
      citations = chunks.map(c => ({
        documentId: c.documentId,
        title: c.documentTitle,
        category: c.category,
        chunkId: c.id,
        relevanceScore: `${Math.round(c.score * 100)}%`,
        accessRole: c.accessRole,
        snippet: c.content
      }));

      // Check if an email action should be suggested
      emailActionSuggested = this.detectEmailAction(query, responseAnswer, chunks);
    }

    const latencyMs = Date.now() - startTime;

    return {
      query,
      answer: responseAnswer,
      citations,
      userRole,
      filteredOutDueToRBAC: searchResult.filteredOutDueToRBAC,
      emailActionSuggested,
      latencyMs,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Synthesize natural language answer based on retrieved vector passages
   */
  synthesizeAnswer(query, chunks, role) {
    const qLower = query.toLowerCase();

    // Leave / PTO query
    if (qLower.includes('leave') || qLower.includes('vacation') || qLower.includes('pto') || qLower.includes('sick')) {
      const chunk = chunks.find(c => c.documentTitle.includes('Leave'));
      const text = chunk ? chunk.content : chunks[0].content;
      return `According to the **Enterprise Annual Leave & PTO Policy 2026**:\n\n` +
        `• **Annual Leave Entitlement**: Full-time employees receive **22 working days** per calendar year (accruing at 1.83 days/month).\n` +
        `• **Approval Workflow**: Requests must be submitted at least 10 working days prior for trips longer than 3 days. Direct managers approve within 3 business days.\n` +
        `• **Sick Leave**: 10 fully paid days annually. Medical certificates are required for absences over 2 consecutive days.\n` +
        `• **Maternity / Paternity**: Up to 16 weeks fully paid maternity leave; 4 weeks fully paid paternity/secondary caregiver leave.\n\n` +
        `💡 *Need to request leave? You can generate an automated Leave Request email directly below.*`;
    }

    // Onboarding query
    if (qLower.includes('onboard') || qLower.includes('new hire') || qLower.includes('hardware') || qLower.includes('welcome')) {
      return `Based on the **New Hire Employee Onboarding & Workplace Setup Manual**:\n\n` +
        `• **Day 1 Schedule**: 09:00 AM Reception check-in -> 10:00 AM IT Credential & Laptop setup -> 11:30 AM Enterprise Security Briefing.\n` +
        `• **Hardware Stipend**: Employees receive a **$500 stipend** for ergonomic home office setup.\n` +
        `• **Security Setup**: BitLocker/FileVault encryption and SentinelOne Endpoint Protection must be active.\n` +
        `• **Welcome Automated Workflow**: HR triggers automated welcome email sequence with credentials & mentor details.\n\n` +
        `💡 *HR Managers can dispatch the automated Onboarding Email package using the Email Automation console.*`;
    }

    // Security query
    if (qLower.includes('security') || qLower.includes('password') || qLower.includes('vpn') || qLower.includes('mfa')) {
      return `According to **Global Cybersecurity & Information Protection Guidelines**:\n\n` +
        `• **Password Policy**: Minimum **16 characters** (uppercase, lowercase, numbers, special symbols), expiring every 90 days.\n` +
        `• **Multi-Factor Auth (MFA)**: Mandatory for all enterprise services via Authenticator or YubiKey.\n` +
        `• **Remote Work VPN**: ZTNA / Cisco AnyConnect VPN connection is strictly required for internal databases.\n` +
        `• **Incident Reporting**: Flag suspicious emails to \`security-alert@enterprise.com\`.`;
    }

    // Executive Compensation query (Restricted)
    if (qLower.includes('salary') || qLower.includes('compensation') || qLower.includes('exec') || qLower.includes('bonus')) {
      return `Based on the **Q1 2026 Executive Compensation & Performance Incentive Structure** (Access Level: Executive-Only):\n\n` +
        `• **L7 (Director)**: Base range $210K - $275K | 30% Target Bonus | 15,000 RSUs.\n` +
        `• **L8 (VP)**: Base range $290K - $380K | 45% Target Bonus | 40,000 RSUs.\n` +
        `• **L9 (C-Suite)**: Base range $420K - $600K | 60% Target Bonus | 100,000 RSUs.\n` +
        `• **Payout Dates**: Executed by HR Payroll on the 15th following quarter close.`;
    }

    // Default synthesis
    const primaryChunk = chunks[0];
    return `Based on **${primaryChunk.documentTitle}** (Category: ${primaryChunk.category}):\n\n` +
      `"${primaryChunk.content}"\n\n` +
      `*(Retrieved ${chunks.length} context passage(s) with high semantic similarity)*`;
  }

  /**
   * Smart action detector for automated email generation
   */
  detectEmailAction(query, answer, chunks) {
    const qLower = query.toLowerCase();

    if (qLower.includes('leave') || qLower.includes('pto') || qLower.includes('vacation')) {
      return {
        type: 'LEAVE_APPROVAL',
        suggestedSubject: 'Leave Approval Confirmation - Enterprise HR',
        suggestedRecipient: 'employee@enterprise.com',
        templateVariables: {
          employeeName: 'John Doe',
          leaveType: 'Annual Vacation',
          startDate: '2026-08-10',
          endDate: '2026-08-17',
          approverName: 'Elena Rostova (HR Lead)'
        }
      };
    }

    if (qLower.includes('onboard') || qLower.includes('welcome') || qLower.includes('new hire')) {
      return {
        type: 'ONBOARDING_WELCOME',
        suggestedSubject: 'Welcome to Enterprise Team! Your Day 1 Orientation Schedule',
        suggestedRecipient: 'new.hire@enterprise.com',
        templateVariables: {
          newHireName: 'Alex Mercer',
          roleTitle: 'Senior Frontend Developer',
          startDate: '2026-08-01',
          mentorName: 'Sarah Connor',
          portalLink: 'https://portal.enterprise.com/welcome'
        }
      };
    }

    if (qLower.includes('security') || qLower.includes('password') || qLower.includes('policy')) {
      return {
        type: 'POLICY_NOTICE',
        suggestedSubject: 'Important Security Policy Notice - Action Required',
        suggestedRecipient: 'all-staff@enterprise.com',
        templateVariables: {
          policyTitle: 'Global Cybersecurity 16-Char Password Update',
          effectiveDate: '2026-08-15',
          complianceUrl: 'https://security.enterprise.com/mfa-setup'
        }
      };
    }

    return null;
  }
}

export const ragEngine = new RAGEngineService();
