# TRENDVERSE CAREERS — Data Sources, Attribution & Honest Limitations

TRENDVERSE CAREERS is built strictly around **free public APIs, official employer ATS boards, and official university/government feeds**. It never scrapes paywalled or login-protected websites, never circumvents CAPTCHAs, and never invents synthetic job vacancies, salaries, or deadlines.

---

## 1. Live Provider Registry & Refresh Policies

| Provider | Type | Attribution & Link Rules | Refresh Cache | Honest Cadence Label |
| :--- | :--- | :--- | :--- | :--- |
| **Himalayas Public Jobs API** | Third-party remote/hybrid jobs | Source credit + direct application URL | 60 minutes | Hourly sync |
| **Remotive Public API** | Third-party remote jobs | Mandatory credit to Remotive + direct Remotive URL; max 4 calls/24h | 360 minutes (6 hours) | Scheduled 6h sync (24h delayed feed) |
| **Arbeitnow Public Job Board** | Third-party Europe/Remote/Werkstudent jobs | Source credit + direct listing URL | 60 minutes | Hourly sync |
| **Jobicy Public Remote API** | Third-party remote jobs | Credit to Jobicy + direct Jobicy URL | 360 minutes (6 hours) | Scheduled 6h sync |
| **Greenhouse Public Boards** (`wikimedia`, `khanacademy`, `gitlab`, `cloudflare`, `mozilla`, `canonical`) | Official Employer Career Pages | Direct link to employer's Greenhouse job board | 60 minutes | Hourly sync |
| **Lever Public Boards** (`spotify`, `ro`) | Official Employer Career Pages | Direct link to employer's Lever job posting | 60 minutes | Hourly sync |
| **US NSF Funding RSS** | Official Government Research Grants | Links directly to `nsf.gov` solicitation | 120 minutes | Every 2h sync |
| **UKRI Opportunity Feed** | Official UK Research & Fellowships | Links directly to `ukri.org` | 120 minutes | Every 2h sync |
| **Scholars4Dev RSS** | Third-party Scholarship Aggregator | Advises verification on host university page | 180 minutes | Every 3h sync |
| **US Federal Register Open API** | Official US Government Notices | Links directly to `federalregister.gov` | 180 minutes | Every 3h sync |
| **UK GOV.UK Official Atom Feed** | Official UK Government Feed | Links directly to `gov.uk` | 180 minutes | Every 3h sync |

---

## 2. Structured Data & AdSense Compliance

- **No `JobPosting` JSON-LD on Third-Party Listings:** Per provider terms (including Remotive) and TRENDVERSE technical SEO policy, `/careers`, `/careers/jobs`, `/careers/internships`, `/careers/remote`, `/careers/fresher`, `/careers/scholarships`, and `/careers/government` emit clean **`BreadcrumbList`** structured data only. `/careers/tools` emits **`WebApplication` + `BreadcrumbList`**.
- **Sponsored Content Rule:** Any future promoted listings carry a `Sponsored` badge (`isSponsored: true`); currently 100% of listings are organic.

---

## 3. Honest Platform Limitations

- **Government Exam Portals (India UPSC / SSC / NCS / State PSCs & International Civil Service Portals):** Most national civil service commissions publish official PDFs/HTML schedules without open unauthenticated JSON APIs. TRENDVERSE provides direct links to official recruitment and notification portals rather than scraping protected pages or guessing dates.
- **Salary & Deadline Coverage:** Many employers do not include salary ranges or closing dates in public feeds. Missing values are explicitly rendered as **Not disclosed by employer** or **Last verified** timestamp rather than estimated or fabricated.
- **Employer Location Accuracy:** "Remote" listings without explicit global authorization are flagged with their stated geographic restriction or a prompt to verify country eligibility on the employer's application page.
