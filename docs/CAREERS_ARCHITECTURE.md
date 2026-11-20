# TRENDVERSE CAREERS 1.0 — Architecture & Route Reference

**Tagline:** *Discover Opportunities. Build Your Future.*  
**Operating Principle:** 100% Free Public APIs, Official Feeds, Open-Source Tooling, and Zero Mandatory Paid Subscriptions.

---

## 1. Integrated Sub-Routes

All TRENDVERSE CAREERS routes work directly via clean URL paths (with SPA fallback) and `#careers/...` hashes:

| Route | Purpose |
| :--- | :--- |
| `/careers` | Main Careers Dashboard (Live clock/IANA timezone, latest jobs, recent internships, remote count, student pathways, scholarship highlights, government portals, trending skills, personalized `localStorage` dashboard) |
| `/careers/jobs` | Advanced multi-facet job search (Title, Skills, Company, Country, City, Employment Type, Work Mode, Experience, Date Posted `24h/3d/7d/30d`, Disclosed Salary Filter, Sorting) |
| `/careers/internships` | Pre-filtered Internships & Working Student opportunities |
| `/careers/remote` | Remote & Work From Home roles with explicit country/region eligibility (never assuming "Remote" = "Worldwide") |
| `/careers/fresher` | Student Opportunity Center covering all 12 sections (`A` Fresher Jobs through `L` Entry-Level Government Jobs) |
| `/careers/scholarships` | International Scholarship Discovery Directory + Live NSF, UKRI, and Scholars4Dev feeds |
| `/careers/government` | Country-specific Government Recruitment Portals (India: UPSC, SSC, NCS, ISRO, DRDO, IBPS + USA, UK, Canada, Australia, Germany, Singapore, UAE, Japan) + live Federal Register & GOV.UK feeds |
| `/careers/tools` | 10 Free Browser-Local Career Tools (with optional free-tier Gemini feedback) |

---

## 2. Backend Endpoints (`server.ts`)

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/careers/opportunities` | `GET` | Aggregates, deduplicates, audits, filters, and sorts live free job boards; returns `items`, `providers`, `trendingSkills`, and freshness `metrics`. |
| `/api/careers/scholarships` | `GET` | Live NSF, UKRI & Scholars4Dev RSS feeds + verified international university/government scholarship directory. |
| `/api/careers/government` | `GET` | Live U.S. Federal Register & UK GOV.UK feeds + curated official country government recruitment portals. |
| `/api/careers/student-resources` | `GET` | Verified free student certifications, hackathons, and open fellowships. |
| `/api/careers/ai-assist` | `POST` | Optional free-tier `@google/genai` helper (`gemini-4-hydrogen` with `gemini-3.1-flash-lite` fallback) for Resume Review, Cover Letter Polish, and Interview STAR Feedback. Returns `aiAvailable: false` gracefully when `GEMINI_API_KEY` is absent. |
