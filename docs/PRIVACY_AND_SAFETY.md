# TRENDVERSE CAREERS — Privacy & Student Safety Policy

## 1. Zero-PII & Browser-Local Personalization
- **No Mandatory Account or Paid Tier:** Visitors can search, filter, save opportunities, track applications, and build resumes without signing in or paying fees.
- **Anonymous `localStorage` Preferences (`trendverse_careers_profile_v1`):** Country, education level, career skills, timezone preference, saved listings, recently viewed items, flagged reports, and Job/Internship Application Tracker records live solely in your browser and can be wiped immediately via **Personalize → Clear Local Profile**.
- **Explicit Location Consent:** Browser geolocation (`navigator.geolocation`) is **never** requested on page load. It runs only when a visitor explicitly clicks **Use My Location** inside the Careers header to infer their IANA timezone and region.
- **Sensitive Personal Information Prohibition:** TRENDVERSE never asks for, collects, or stores Aadhaar numbers, passport numbers, national IDs, bank account numbers, OTPs, or passwords.

## 2. Automated Student Safety & Anti-Scam Scanner (`safetyScanner.ts`)
Every fetched opportunity passes automated screening before display:
- **Risk Phrases Flagged:** Registration fees, application/processing fees, paid training bonds, security deposits, WhatsApp/Telegram-only application requests, unrealistic guaranteed income claims, and requests for banking/ID documents.
- **Suspicious Redirect Domains Flagged:** URL shorteners (`bit.ly`, `tinyurl.com`) or messaging-only hosts (`t.me`, `wa.me`, `chat.whatsapp.com`).
- **Transparent Verification Labels:**
  - `Official source` — Direct ATS board (`greenhouse.io`, `lever.co`) or official `.gov` / government funding feed.
  - `Verified source link` — Validated direct link from a curated programme.
  - `Third-party listing` — Reputable public aggregator (`Remotive`, `Himalayas`, `Arbeitnow`, `Jobicy`, `Scholars4Dev`).
  - `Potentially suspicious` — Automated risk flags triggered; accompanied by an explicit warning banner.
- **User Reporting:** Every listing card includes a **Report** control for flagging broken links, closed roles, duplicates, or scam signals.
