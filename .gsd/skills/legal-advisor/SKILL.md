# Legal Advisor Skill

**When to use:** Legal documents, privacy policy, terms of service, contracts, compliance, GDPR, licensing, legal review

---

## Overview

Legal guidance for SaaS products, startups, and digital businesses. Covers essential legal documents, compliance (GDPR, CCPA), contracts, and risk mitigation.

**⚠️ DISCLAIMER:** This skill provides general legal information, not legal advice. Always consult a qualified lawyer for specific legal matters.

---

## Essential Legal Documents

### 1. Privacy Policy

**Required when:** Collecting any user data (emails, names, analytics)

**Must include:**
```markdown
# Privacy Policy for [Product Name]

**Last Updated:** [Date]

## 1. Information We Collect

### Information You Provide:
- Email address (required for account creation)
- Name (optional)
- Product data (checklists, tasks, goals you create)
- Payment information (processed by Stripe, we don't store card details)

### Automatically Collected:
- IP address
- Browser type and version
- Device information
- Usage data (pages visited, features used)
- Cookies (see Cookie Policy)

## 2. How We Use Your Information

- Provide and improve our service
- Send product updates and announcements (you can opt out)
- Analyze usage to improve features
- Prevent fraud and abuse
- Comply with legal obligations

**We never:**
- Sell your personal data to third parties
- Share your data without consent (except as required by law)
- Use your data for advertising

## 3. Data Sharing

We share data only with:
- **Service providers:** Vercel (hosting), Stripe (payments), SendGrid (emails)
- **Legal requirements:** When required by law or to protect rights

## 4. Data Storage & Security

- Data stored in: [Region, e.g., US, EU]
- Encrypted in transit (HTTPS) and at rest
- Regular security audits
- Access controls and authentication

## 5. Your Rights (GDPR/CCPA)

You have the right to:
- **Access:** Request a copy of your data
- **Rectification:** Correct inaccurate data
- **Erasure:** Delete your account and data
- **Portability:** Export your data (JSON format)
- **Object:** Opt out of marketing emails

**How to exercise rights:** Email privacy@tiramisup.com

## 6. Data Retention

- Active accounts: Data retained while account is active
- Deleted accounts: Data deleted within 30 days
- Backups: Removed from backups within 90 days

## 7. Children's Privacy

Our service is not directed to children under 13. We do not knowingly collect data from children.

## 8. International Transfers

If you're in the EU/EEA, your data may be transferred to the US. We use Standard Contractual Clauses (SCCs) for protection.

## 9. Changes to This Policy

We'll notify you of material changes via email or in-app notice.

## 10. Contact Us

Questions? Email: privacy@tiramisup.com
```

---

### 2. Terms of Service (ToS)

**Required when:** Offering a service to users

**Must include:**
```markdown
# Terms of Service

**Last Updated:** [Date]

By using Tiramisup, you agree to these terms.

## 1. Service Description

Tiramisup provides a launch readiness platform for tracking product development progress.

## 2. Account Terms

- You must be 13+ years old
- You're responsible for account security
- One account per person
- You're responsible for all activity under your account

## 3. Acceptable Use

**You may not:**
- Violate laws or regulations
- Infringe intellectual property rights
- Transmit viruses or malicious code
- Attempt to hack or disrupt the service
- Abuse, harass, or threaten others
- Use the service for illegal purposes
- Scrape or data mine without permission

## 4. User Content

- You retain ownership of your content
- You grant us license to host and display your content
- You're responsible for your content's legality
- We may remove content that violates these terms

## 5. Payment Terms

- Subscription fees are charged monthly/annually
- All fees are in USD
- Refunds: 30-day money-back guarantee
- We may change prices with 30 days notice
- Failed payments may result in service suspension

## 6. Cancellation & Termination

**You can cancel anytime:**
- No refunds for partial months
- Access continues until end of billing period
- Data deleted 30 days after cancellation

**We may terminate if you:**
- Violate these terms
- Use the service fraudulently
- Engage in abusive behavior

## 7. Service Availability

- We aim for 99.9% uptime but don't guarantee it
- Maintenance windows will be announced
- We're not liable for downtime

## 8. Intellectual Property

- Tiramisup owns the service, code, and trademarks
- You may not copy, modify, or reverse engineer
- User content remains yours

## 9. Limitation of Liability

SERVICE PROVIDED "AS IS" WITHOUT WARRANTY.

WE'RE NOT LIABLE FOR:
- Lost profits or data
- Indirect or consequential damages
- Service interruptions
- Third-party actions

**Maximum liability:** Amount you paid in last 12 months

## 10. Dispute Resolution

- Governed by [State/Country] law
- Disputes resolved in [Jurisdiction] courts
- Or binding arbitration (if you prefer)

## 11. Changes to Terms

We may update these terms. Continued use = acceptance.

## 12. Contact

Questions? Email: legal@tiramisup.com
```

---

### 3. Cookie Policy

**Required when:** Using cookies or tracking

```markdown
# Cookie Policy

We use cookies to improve your experience.

## What Are Cookies?

Small text files stored on your device.

## Cookies We Use

### Essential (Required):
- Session cookies (keep you logged in)
- Security cookies (prevent fraud)

### Analytics (Optional):
- Google Analytics (usage patterns)
- Can opt out via browser settings

### Preferences (Optional):
- Theme preference (dark/light mode)
- Language selection

## Managing Cookies

**Browser settings:**
- Chrome: Settings > Privacy > Cookies
- Firefox: Settings > Privacy > Cookies
- Safari: Preferences > Privacy

**Note:** Disabling essential cookies may break functionality.

## Third-Party Cookies

We don't use advertising cookies. Analytics cookies are from:
- Google Analytics (opt-out: https://tools.google.com/dlpage/gaoptout)

## Updates

We'll notify you of significant changes.

**Contact:** privacy@tiramisup.com
```

---

## GDPR Compliance

### GDPR Checklist

```markdown
## GDPR Compliance Checklist for Tiramisup

### Legal Basis for Processing
- [ ] Consent (for marketing emails)
- [ ] Contract (for service delivery)
- [ ] Legitimate interest (for analytics)

### User Rights Implementation
- [ ] Right to access: Export data feature
- [ ] Right to erasure: Account deletion
- [ ] Right to portability: JSON export
- [ ] Right to rectification: Edit profile
- [ ] Right to object: Unsubscribe from emails

### Documentation
- [ ] Privacy Policy published
- [ ] Cookie banner implemented
- [ ] Data Processing Agreement (DPA) with vendors
- [ ] Records of Processing Activities (ROPA)

### Security Measures
- [ ] HTTPS encryption
- [ ] Password hashing (bcrypt)
- [ ] Access controls (authentication)
- [ ] Regular security audits
- [ ] Data breach notification procedure (72 hours)

### Data Minimization
- [ ] Collect only necessary data
- [ ] Retention policy defined
- [ ] Automatic data deletion after 30 days (deleted accounts)

### Vendor Compliance
- [ ] Stripe: GDPR compliant ✅
- [ ] Vercel: GDPR compliant ✅
- [ ] SendGrid: GDPR compliant ✅
```

---

## CCPA Compliance (California)

### CCPA Requirements

**If you have California users:**

```markdown
## California Privacy Rights (CCPA)

California residents have the right to:

1. **Know:** What personal information we collect
2. **Delete:** Request deletion of your data
3. **Opt-Out:** Opt out of data "sales" (we don't sell data)
4. **Non-Discrimination:** We won't discriminate for exercising rights

**How to exercise rights:**
Email: privacy@tiramisup.com with subject "California Privacy Request"

**Response time:** 45 days
```

---

## Contract Templates

### 1. Freelancer/Contractor Agreement

```markdown
# Service Agreement

**Between:**
- Client: [Company Name]
- Contractor: [Name]

**Services:** [Description]
**Duration:** [Start] - [End]
**Payment:** $[Amount] per [hour/project]

## Terms

### 1. Scope of Work
[Detailed description of deliverables]

### 2. Payment Terms
- Payment schedule: [Net 15/30/Upon completion]
- Late payment: 1.5% monthly interest

### 3. Intellectual Property
- **Work Product:** Transfers to Client upon full payment
- **Pre-existing IP:** Remains with Contractor

### 4. Confidentiality
Both parties agree to keep confidential information private.

### 5. Termination
Either party may terminate with [7/14/30] days notice.

**Signatures:**
- Client: _________________ Date: _______
- Contractor: _____________ Date: _______
```

---

### 2. Non-Disclosure Agreement (NDA)

```markdown
# Non-Disclosure Agreement

**Between:** [Disclosing Party] and [Receiving Party]

## 1. Confidential Information

Includes: Business plans, code, customer data, financials, trade secrets.

**Excludes:**
- Public information
- Independently developed information
- Previously known information

## 2. Obligations

Receiving Party agrees to:
- Keep information confidential
- Use only for permitted purposes
- Not disclose to third parties (except with consent)

## 3. Duration

Obligations last [1/2/3/5] years from disclosure date.

## 4. Return of Information

Upon request, Receiving Party must return or destroy all confidential materials.

## 5. Remedies

Breach may result in injunctive relief and damages.

**Signatures:**
- Party 1: _________________ Date: _______
- Party 2: _________________ Date: _______
```

---

## Licenses

### Open Source License Selection

**MIT License (Most Permissive):**
```
✅ Use: Commercial use, modification, distribution, private use
❌ Liability/Warranty: None
📝 Requirement: Include license and copyright notice
```

**Apache 2.0 (Patent Protection):**
```
✅ Use: Same as MIT + patent grant
❌ Liability/Warranty: None
📝 Requirements: Include license, copyright, state changes
```

**GPL v3 (Copyleft):**
```
✅ Use: Commercial use, modification, distribution
❌ Derivative works must be GPL
📝 Requirements: Disclose source, include license, state changes
```

**Which to choose:**
- **MIT:** Maximum freedom (React, Next.js use this)
- **Apache 2.0:** If patent protection matters
- **GPL:** If you want derivatives to stay open

---

## SaaS-Specific Legal Issues

### Data Processing Agreement (DPA)

**For B2B customers (GDPR):**

```markdown
# Data Processing Agreement

Tiramisup (Processor) processes personal data on behalf of Customer (Controller).

## 1. Processing Details

- **Subject matter:** Provision of Tiramisup service
- **Data subjects:** Customer's end users
- **Categories of data:** Names, emails, product data
- **Purpose:** Service delivery

## 2. Processor Obligations

- Process only per Customer instructions
- Ensure data security
- Assist with data subject requests
- Delete data upon termination

## 3. Sub-processors

- Vercel (hosting)
- Stripe (payments)
- SendGrid (emails)

Customer consents to these sub-processors.

## 4. Data Breach Notification

Processor will notify Customer within 24 hours of breach.

**Signatures:**
- Customer: _________________ Date: _______
- Tiramisup: _______________ Date: _______
```

---

## Compliance Automation

### GDPR Data Export Feature

```typescript
// app/api/export/route.ts
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const userId = session.user.id;

  // Gather all user data
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      products: {
        include: {
          checklists: true,
          tasks: true,
          goals: true,
        },
      },
    },
  });

  // Return as JSON
  return new Response(JSON.stringify(userData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="tiramisup-data-export-${Date.now()}.json"`,
    },
  });
}
```

---

### Account Deletion (Right to Erasure)

```typescript
// app/api/account/delete/route.ts
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const userId = session.user.id;

  // Delete all related data (cascade)
  await prisma.user.delete({
    where: { id: userId },
  });

  // Log deletion for compliance (30-day retention)
  await prisma.deletionLog.create({
    data: {
      userId,
      deletedAt: new Date(),
      scheduledPurgeAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return new Response("Account deleted", { status: 200 });
}
```

---

## Best Practices

### ✅ DO:
- Use plain language (avoid legalese when possible)
- Make privacy policy easy to find (footer link)
- Get explicit consent for marketing emails
- Log consent (timestamp + IP)
- Implement cookie banner (for EU users)
- Respond to data requests within 30 days
- Keep records of data breaches
- Review legal docs annually
- Use HTTPS everywhere
- Hash passwords (never store plaintext)

### ❌ DON'T:
- Copy legal docs without customization
- Hide terms in small print
- Pre-check consent boxes (must be opt-in)
- Ignore data subject requests
- Sell user data without explicit consent
- Use dark patterns (trick users into agreeing)
- Ignore GDPR if you have EU users
- Forget to update "Last Updated" date

---

## Legal Review Checklist

```markdown
## Pre-Launch Legal Checklist

### Documentation
- [ ] Privacy Policy live at /privacy
- [ ] Terms of Service live at /terms
- [ ] Cookie Policy (if using cookies)
- [ ] Footer links to all policies

### GDPR (if EU users)
- [ ] Cookie consent banner
- [ ] Data export feature
- [ ] Account deletion feature
- [ ] Privacy policy mentions EU rights
- [ ] DPA available for B2B customers

### CCPA (if California users)
- [ ] Privacy policy mentions CCPA rights
- [ ] "Do Not Sell My Info" link (if applicable)

### Security
- [ ] HTTPS enforced
- [ ] Passwords hashed
- [ ] API authentication
- [ ] Rate limiting

### Payments
- [ ] Clear refund policy
- [ ] Terms mention payment terms
- [ ] Failed payment handling

### Content
- [ ] DMCA agent designated (if user content)
- [ ] Content moderation policy
- [ ] Abuse reporting mechanism
```

---

## When to Hire a Lawyer

**Hire a lawyer if:**
- Raising venture capital (need legal docs)
- Handling sensitive data (health, financial)
- B2B/Enterprise contracts (custom terms needed)
- International expansion (multi-country compliance)
- IP disputes or litigation
- Regulatory compliance (HIPAA, SOC2, etc.)

**DIY is okay for:**
- Early MVP with standard terms
- Small SaaS with consumer users
- Using trusted templates
- Low-risk product (no health/finance data)

---

## Resources

- **Privacy Policy Generator:** https://www.termsfeed.com/
- **ToS Generator:** https://www.termsfeed.com/
- **GDPR Checklist:** https://gdpr.eu/checklist/
- **CCPA Compliance:** https://oag.ca.gov/privacy/ccpa
- **Lawyer Marketplaces:** Upwork, LegalZoom, Rocket Lawyer

---

## Sample Implementation

**Footer Links:**
```tsx
// components/Footer.tsx
export function Footer() {
  return (
    <footer className="border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-center space-x-6 text-sm text-gray-600">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/cookies">Cookie Policy</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <p className="text-center text-xs text-gray-500 mt-4">
          © 2026 Tiramisup. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
```

---

**⚠️ REMINDER:** This is educational information, not legal advice. Consult a lawyer for your specific situation.

---

**Last Updated:** 2026-03-20  
**For:** Tiramisup legal compliance + general SaaS legal guidance
