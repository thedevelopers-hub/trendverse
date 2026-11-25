import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Briefcase,
  Calculator,
  Check,
  CheckSquare,
  Compass,
  Copy,
  DollarSign,
  FileCheck,
  FileText,
  GraduationCap,
  MessageSquare,
  Plus,
  Printer,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { CareerAiAssistResponse } from '../../../server/types';
import { CareerToolId } from '../../types/editorial';
import { requestCareerAiAssist } from '../../services/careersApi';
import { ApplicationTrackerEntry } from '../../utils/careerPreferences';
import { trackFormSubmit } from '../../utils/thirdPartyScripts';

interface CareerToolsSuiteProps {
  activeTool: CareerToolId;
  onSelectTool: (tool: CareerToolId) => void;
  applications: ApplicationTrackerEntry[];
  onSaveApplications: (next: ApplicationTrackerEntry[]) => void;
}

const TOOL_TABS: Array<{
  id: CareerToolId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'resume-builder', label: 'Resume Builder', icon: FileText },
  { id: 'ats-checker', label: 'ATS Resume Checker', icon: FileCheck },
  { id: 'cover-letter', label: 'Cover Letter Builder', icon: BookOpen },
  { id: 'interview-practice', label: 'Interview Practice', icon: MessageSquare },
  { id: 'salary-calculator', label: 'Salary Calculator', icon: DollarSign },
  { id: 'hourly-converter', label: 'Hourly-to-Monthly', icon: Calculator },
  { id: 'skills-gap', label: 'Skills Gap Checklist', icon: CheckSquare },
  { id: 'career-paths', label: 'Career Path Explorer', icon: Compass },
  { id: 'job-tracker', label: 'Job Tracker', icon: Briefcase },
  { id: 'internship-tracker', label: 'Internship Tracker', icon: GraduationCap },
];

const CAREER_PATHS_DATA: Record<
  string,
  {
    overview: string;
    entryRoles: string[];
    coreSkills: string[];
    freeResources: Array<{ title: string; url: string }>;
  }
> = {
  'Software & Full-Stack Engineering': {
    overview: 'Build web services, APIs, and applications. High global remote & fresher internship availability.',
    entryRoles: ['Junior Software Engineer', 'Frontend Developer Intern', 'Backend / API Trainee'],
    coreSkills: ['HTML/CSS', 'TypeScript', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'REST APIs', 'Unit Testing'],
    freeResources: [
      { title: 'freeCodeCamp Curriculum', url: 'https://www.freecodecamp.org/learn/' },
      { title: 'Harvard CS50x', url: 'https://cs50.harvard.edu/x/' },
    ],
  },
  'Data Science & AI Engineering': {
    overview: 'Analyze datasets, build predictive models, and evaluate AI workflows responsibly.',
    entryRoles: ['Data Analyst Intern', 'Junior ML Engineer', 'Research Assistant'],
    coreSkills: ['Python', 'SQL', 'Pandas', 'Statistics', 'Machine Learning', 'Data Visualization', 'Git', 'LLM Evaluation'],
    freeResources: [
      { title: 'Kaggle Learn Free Courses', url: 'https://www.kaggle.com/learn' },
      { title: 'Google Machine Learning Crash Course', url: 'https://developers.google.com/machine-learning/crash-course' },
    ],
  },
  'Cybersecurity & Cloud Infrastructure': {
    overview: 'Secure networks, manage cloud workloads, and automate infrastructure reliably.',
    entryRoles: ['SOC Analyst Tier 1', 'Cloud Operations Intern', 'Junior DevOps Engineer'],
    coreSkills: ['Linux', 'Networking (TCP/IP)', 'Docker', 'AWS / GCP Basics', 'IAM Security', 'Bash / Python', 'Terraform'],
    freeResources: [
      { title: 'Cloudflare Learning Center', url: 'https://www.cloudflare.com/learning/' },
      { title: 'NIST Cybersecurity Framework', url: 'https://www.nist.gov/cyberframework' },
    ],
  },
  'Product, Growth & Digital Business': {
    overview: 'Bridge user needs, analytics, and clear written communication across teams.',
    entryRoles: ['Associate Product Analyst', 'Business Operations Intern', 'Technical SEO / Content Associate'],
    coreSkills: ['Excel / Sheets', 'SQL Basics', 'User Research', 'Technical SEO', 'Product Metrics', 'A/B Testing', 'Clear Writing'],
    freeResources: [
      { title: 'Google Digital Garage / Analytics Academy', url: 'https://analytics.google.com/analytics/academy/' },
    ],
  },
  'Public Policy, Civil Services & Research': {
    overview: 'Competitive public examinations, policy fellowships, and institutional academic research.',
    entryRoles: ['Policy Research Intern', 'Junior Research Fellow (JRF)', 'Civil Service Aspirant'],
    coreSkills: ['Academic Writing', 'Qualitative & Quantitative Research', 'Public Policy', 'Data Literacy', 'Constitutional / Economic Basics'],
    freeResources: [
      { title: 'SWAYAM / NPTEL Free Courses', url: 'https://swayam.gov.in/' },
    ],
  },
};

const INTERVIEW_BANK: Record<string, string[]> = {
  'Student / Fresher Behavioral': [
    'Tell me about a challenging university or personal project where something broke unexpectedly. How did you debug it?',
    'Describe a time you had to learn an unfamiliar tool or subject under a tight deadline.',
    'Why are you interested in this specific team, mission, or scholarship programme?',
  ],
  'Software & Technical': [
    'Explain the trade-offs between REST APIs and GraphQL, or SQL vs NoSQL databases for a growing web app.',
    'How do you keep secrets safe in full-stack applications and prevent common web vulnerabilities like XSS?',
    'Walk through how you diagnose slow queries or slow page rendering step by step.',
  ],
  'Scholarship & Fellowship': [
    'What specific global or community problem do you aim to address through this degree or fellowship?',
    'How does your past academic work or community leadership prepare you for this cohort?',
  ],
};

export const CareerToolsSuite: React.FC<CareerToolsSuiteProps> = ({
  activeTool,
  onSelectTool,
  applications,
  onSaveApplications,
}) => {
  // 1. Resume Builder state
  const [resName, setResName] = useState('Aarav Sharma');
  const [resEmail, setResEmail] = useState('aarav.sharma@example.com');
  const [resLocation, setResLocation] = useState('Bengaluru, India · Open to Remote');
  const [resRole, setResRole] = useState('Junior Full-Stack & Data Engineer');
  const [resSummary, setResSummary] = useState(
    'Final-year Computer Science student focused on TypeScript, Python, and accessible web applications.'
  );
  const [resEducation, setResEducation] = useState(
    'B.Tech in Computer Science (2022–2026) — Coursework: Data Structures, Databases, Operating Systems'
  );
  const [resExperience, setResExperience] = useState(
    'Software Engineering Intern (May–Jul 2025): Built REST endpoints and reduced dashboard query time by 28% using indexed PostgreSQL queries.'
  );
  const [resSkills, setResSkills] = useState('TypeScript, React, Python, PostgreSQL, Git, Docker, Linux');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 2. ATS Resume Checker state
  const [atsResumeText, setAtsResumeText] = useState('');
  const [atsJobDesc, setAtsJobDesc] = useState('');

  // 3. Cover Letter state
  const [clName, setClName] = useState('Aarav Sharma');
  const [clRole, setClRole] = useState('Software Engineering Intern');
  const [clCompany, setClCompany] = useState('Wikimedia Foundation');
  const [clHighlights, setClHighlights] = useState(
    'Built an accessible open-source documentation search index using TypeScript and SQL.'
  );

  // 4. Interview Practice state
  const [interviewTrack, setInterviewTrack] = useState<string>('Student / Fresher Behavioral');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [interviewAnswer, setInterviewAnswer] = useState('');

  // Optional Gemini Assist state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<CareerAiAssistResponse | null>(null);

  // 5. Salary Calculator state
  const [grossAnnual, setGrossAnnual] = useState(60000);
  const [salaryCurrency, setSalaryCurrency] = useState('USD');
  const [estTaxPercent, setEstTaxPercent] = useState(18);
  const [retirementPercent, setRetirementPercent] = useState(5);

  // 6. Hourly-to-Monthly state
  const [hourlyRate, setHourlyRate] = useState(25);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [weeksPerYear, setWeeksPerYear] = useState(50);

  // 7 & 8. Skills Gap & Career Paths state
  const [selectedCareerPath, setSelectedCareerPath] = useState<string>(
    'Software & Full-Stack Engineering'
  );
  const [checkedSkills, setCheckedSkills] = useState<Record<string, boolean>>({
    'HTML/CSS': true,
    JavaScript: true,
    Git: true,
  });

  // 9 & 10. Application Tracker form state
  const [trkTitle, setTrkTitle] = useState('');
  const [trkOrg, setTrkOrg] = useState('');
  const [trkLoc, setTrkLoc] = useState('Remote');
  const [trkSalary, setTrkSalary] = useState('');
  const [trkDeadline, setTrkDeadline] = useState('');
  const [trkUrl, setTrkUrl] = useState('');
  const [trkStatus, setTrkStatus] = useState<ApplicationTrackerEntry['status']>('Applied');

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore
    }
  };

  // Plain-text Resume output
  const resumePlainText = `${resName}\n${resRole}\n${resLocation} | ${resEmail}\n\nSUMMARY\n${resSummary}\n\nEDUCATION\n${resEducation}\n\nEXPERIENCE & PROJECTS\n${resExperience}\n\nSKILLS\n${resSkills}`;

  // Browser-local ATS Heuristic Analysis (No AI required; never promises guaranteed ATS score)
  const atsLocalAnalysis = useMemo(() => {
    const resumeLower = atsResumeText.toLowerCase();
    const jdWords = Array.from(
      new Set(
        (atsJobDesc.toLowerCase().match(/\b[a-z][a-z0-9+#.-]{2,}\b/g) || []).filter(
          (w) => !['and', 'the', 'for', 'with', 'you', 'will', 'our', 'are', 'that', 'this', 'from', 'have'].includes(w)
        )
      )
    ).slice(0, 28);

    const matched = jdWords.filter((w) => resumeLower.includes(w));
    const missing = jdWords.filter((w) => !resumeLower.includes(w));
    const hasEmail = /@/.test(atsResumeText);
    const hasMetrics = /\d+%|\$\d+|\d+\+/.test(atsResumeText);
    const hasSections = /(experience|education|skills|projects)/i.test(atsResumeText);
    const wordCount = atsResumeText.trim() ? atsResumeText.trim().split(/\s+/).length : 0;

    return {
      jdKeywordTotal: jdWords.length,
      matched,
      missing: missing.slice(0, 12),
      hasEmail,
      hasMetrics,
      hasSections,
      wordCount,
    };
  }, [atsResumeText, atsJobDesc]);

  // Generated Cover Letter text
  const coverLetterDraft = `Dear Hiring Team at ${clCompany},\n\nI am writing to express my strong interest in the ${clRole} position. With a focus on practical execution and continuous learning, I recently ${clHighlights}\n\nI admire ${clCompany}'s work and would welcome the chance to contribute reliability, curiosity, and structured problem-solving to your team.\n\nThank you for considering my application.\n\nSincerely,\n${clName}`;

  const handleRunOptionalGemini = async (
    mode: 'resume-review' | 'cover-letter' | 'interview-feedback',
    text: string,
    role: string,
    company?: string
  ) => {
    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await requestCareerAiAssist({
        mode,
        targetRole: role,
        company,
        text,
      });
      setAiResponse(res);
    } catch (err) {
      setAiResponse({
        aiAvailable: false,
        mode,
        modelName: 'gemini-4-hydrogen',
        generatedAt: new Date().toISOString(),
        suggestions: [],
        disclaimer: 'Browser-local analysis remains available with zero AI cost.',
        errorMessage: err instanceof Error ? err.message : 'Unable to connect to optional Gemini helper.',
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Salary Calculations
  const taxAmt = (grossAnnual * estTaxPercent) / 100;
  const retireAmt = (grossAnnual * retirementPercent) / 100;
  const netAnnual = Math.max(0, grossAnnual - taxAmt - retireAmt);
  const netMonthly = netAnnual / 12;

  // Hourly-to-Monthly Calculations
  const weeklyGross = hourlyRate * hoursPerWeek;
  const annualFromHourly = weeklyGross * weeksPerYear;
  const monthlyFromHourly = annualFromHourly / 12;

  // Active tracker kind
  const trackerKind: 'job' | 'internship' =
    activeTool === 'internship-tracker' ? 'internship' : 'job';
  const filteredApps = applications.filter((a) => a.kind === trackerKind);

  const handleAddTrackerItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trkTitle.trim() || !trkOrg.trim()) return;
    const entry: ApplicationTrackerEntry = {
      id: `app-${Date.now()}`,
      kind: trackerKind,
      title: trkTitle.trim(),
      organization: trkOrg.trim(),
      location: trkLoc.trim() || 'Remote',
      stipendOrSalary: trkSalary.trim() || undefined,
      deadline: trkDeadline.trim() || undefined,
      url: trkUrl.trim() || undefined,
      status: trkStatus,
      notes: '',
      updatedAt: new Date().toISOString(),
    };
    onSaveApplications([entry, ...applications]);
    trackFormSubmit({
      formName: 'career_application_tracker',
      formLocation: 'careers_tools',
      formCategory: trackerKind,
    });
    setTrkTitle('');
    setTrkOrg('');
    setTrkSalary('');
    setTrkDeadline('');
    setTrkUrl('');
  };

  const handleUpdateTrackerStatus = (id: string, status: ApplicationTrackerEntry['status']) => {
    onSaveApplications(
      applications.map((a) =>
        a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a
      )
    );
  };

  const handleDeleteTrackerItem = (id: string) => {
    onSaveApplications(applications.filter((a) => a.id !== id));
  };

  const pathInfo = CAREER_PATHS_DATA[selectedCareerPath];
  const checkedCount = pathInfo.coreSkills.filter((s) => checkedSkills[s]).length;

  return (
    <div className="space-y-6">
      {/* Tool Navigation Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {TOOL_TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onSelectTool(t.id);
                setAiResponse(null);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400'
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. RESUME BUILDER */}
      {activeTool === 'resume-builder' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6 space-y-3 rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Clean ATS-Safe Resume Builder (100% Browser-Local)
            </h3>
            <p className="text-xs text-slate-600">
              Fill out plain, single-column sections for maximum parser compatibility. Print to PDF or
              copy plain text anytime.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={resName}
                onChange={(e) => setResName(e.target.value)}
                placeholder="Full Name"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="email"
                value={resEmail}
                onChange={(e) => setResEmail(e.target.value)}
                placeholder="Email"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={resRole}
                onChange={(e) => setResRole(e.target.value)}
                placeholder="Target Headline / Role"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={resLocation}
                onChange={(e) => setResLocation(e.target.value)}
                placeholder="City, Country"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Summary</label>
              <textarea
                rows={2}
                value={resSummary}
                onChange={(e) => setResSummary(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Education</label>
              <textarea
                rows={2}
                value={resEducation}
                onChange={(e) => setResEducation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Experience &amp; Student Projects
              </label>
              <textarea
                rows={3}
                value={resExperience}
                onChange={(e) => setResExperience(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Skills</label>
              <input
                type="text"
                value={resSkills}
                onChange={(e) => setResSkills(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Single-Column Live Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void copyText('resume', resumePlainText)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-400 cursor-pointer"
                >
                  {copiedId === 'resume' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedId === 'resume' ? 'Copied' : 'Copy Text'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#0b1324] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-white p-6 shadow-xs border border-slate-200 space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-display text-2xl font-bold text-slate-900">{resName || 'Your Name'}</h4>
                <p className="text-sm font-medium text-blue-700">{resRole}</p>
                <p className="text-xs text-slate-500 mt-1">{resLocation} · {resEmail}</p>
              </div>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Summary</h5>
                <p className="mt-1 text-sm text-slate-700">{resSummary}</p>
              </div>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Education</h5>
                <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">{resEducation}</p>
              </div>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Experience &amp; Projects</h5>
                <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">{resExperience}</p>
              </div>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Skills</h5>
                <p className="mt-1 text-sm text-slate-700">{resSkills}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ATS-FRIENDLY RESUME CHECKER */}
      {activeTool === 'ats-checker' && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                ATS-Friendly Resume Checker (Local Keyword &amp; Structure Check)
              </h3>
              <p className="text-xs text-slate-600">
                Runs instantly in your browser. Disclaimer: No automated checker can guarantee an ATS pass score or interview selection.
              </p>
            </div>
            <button
              type="button"
              disabled={aiLoading || !atsResumeText.trim()}
              onClick={() =>
                void handleRunOptionalGemini(
                  'resume-review',
                  `${atsResumeText}\n\nTarget Description:\n${atsJobDesc}`,
                  resRole || 'Target Role'
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b1324] px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              <span>{aiLoading ? 'Reviewing…' : 'Optional AI Feedback'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Paste Resume Text
              </label>
              <textarea
                rows={7}
                value={atsResumeText}
                onChange={(e) => setAtsResumeText(e.target.value)}
                placeholder="Paste your plain-text resume content here…"
                className="w-full rounded-lg border border-slate-300 p-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Paste Target Job / Internship Description (Optional)
              </label>
              <textarea
                rows={7}
                value={atsJobDesc}
                onChange={(e) => setAtsJobDesc(e.target.value)}
                placeholder="Paste job requirements to compare keyword overlap…"
                className="w-full rounded-lg border border-slate-300 p-3 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="text-slate-500">Word Count</p>
              <p className="font-mono-tabular text-base font-bold text-slate-900">
                {atsLocalAnalysis.wordCount}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="text-slate-500">Standard Sections</p>
              <p className="font-semibold text-slate-900">
                {atsLocalAnalysis.hasSections ? 'Detected' : 'Missing headings'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="text-slate-500">Measurable Metrics</p>
              <p className="font-semibold text-slate-900">
                {atsLocalAnalysis.hasMetrics ? 'Present (good)' : 'Add %, $, or counts'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="text-slate-500">JD Keyword Overlap</p>
              <p className="font-mono-tabular text-base font-bold text-blue-700">
                {atsLocalAnalysis.jdKeywordTotal > 0
                  ? `${atsLocalAnalysis.matched.length} / ${atsLocalAnalysis.jdKeywordTotal}`
                  : 'Add JD text'}
              </p>
            </div>
          </div>

          {atsLocalAnalysis.missing.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
              <span className="font-semibold text-slate-800">Unmatched terms from job text: </span>
              <span className="text-slate-600">{atsLocalAnalysis.missing.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. COVER LETTER BUILDER */}
      {activeTool === 'cover-letter' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-3 rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-display text-lg font-bold text-slate-900">Cover Letter Builder</h3>
            <input
              type="text"
              value={clName}
              onChange={(e) => setClName(e.target.value)}
              placeholder="Your Name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={clRole}
              onChange={(e) => setClRole(e.target.value)}
              placeholder="Role Title"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={clCompany}
              onChange={(e) => setClCompany(e.target.value)}
              placeholder="Organization / University"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <textarea
              rows={3}
              value={clHighlights}
              onChange={(e) => setClHighlights(e.target.value)}
              placeholder="Key achievement or relevant project…"
              className="w-full rounded-lg border border-slate-300 p-3 text-sm"
            />
            <button
              type="button"
              disabled={aiLoading}
              onClick={() =>
                void handleRunOptionalGemini('cover-letter', coverLetterDraft, clRole, clCompany)
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b1324] px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-600 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              <span>{aiLoading ? 'Polishing…' : 'Optional Gemini Polish'}</span>
            </button>
          </div>
          <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Draft Output
              </span>
              <button
                type="button"
                onClick={() => void copyText('cl', coverLetterDraft)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-400 cursor-pointer"
              >
                {copiedId === 'cl' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedId === 'cl' ? 'Copied' : 'Copy Letter'}</span>
              </button>
            </div>
            <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">
              {coverLetterDraft}
            </pre>
          </div>
        </div>
      )}

      {/* 4. INTERVIEW QUESTION PRACTICE */}
      {activeTool === 'interview-practice' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Interview Question Practice (STAR Structure)
            </h3>
            <select
              value={interviewTrack}
              onChange={(e) => {
                setInterviewTrack(e.target.value);
                setQuestionIdx(0);
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium"
            >
              {Object.keys(INTERVIEW_BANK).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Practice Prompt #{questionIdx + 1}
            </p>
            <p className="mt-1 font-display text-base font-bold text-slate-900">
              {INTERVIEW_BANK[interviewTrack][questionIdx % INTERVIEW_BANK[interviewTrack].length]}
            </p>
            <button
              type="button"
              onClick={() =>
                setQuestionIdx((i) => (i + 1) % INTERVIEW_BANK[interviewTrack].length)
              }
              className="mt-2 text-xs font-semibold text-blue-700 underline cursor-pointer"
            >
              Next prompt →
            </button>
          </div>

          <textarea
            rows={5}
            value={interviewAnswer}
            onChange={(e) => setInterviewAnswer(e.target.value)}
            placeholder="Write your STAR answer (Situation, Task, Action, Result)…"
            className="w-full rounded-lg border border-slate-300 p-3 text-sm"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Word count: {interviewAnswer.trim() ? interviewAnswer.trim().split(/\s+/).length : 0} (aim
              for 120–220 words for a crisp 60–90s spoken response)
            </span>
            <button
              type="button"
              disabled={aiLoading || !interviewAnswer.trim()}
              onClick={() =>
                void handleRunOptionalGemini(
                  'interview-feedback',
                  `Prompt: ${INTERVIEW_BANK[interviewTrack][questionIdx]}\n\nAnswer: ${interviewAnswer}`,
                  interviewTrack
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b1324] px-3.5 py-2 font-semibold text-white hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              <span>{aiLoading ? 'Evaluating…' : 'Optional AI STAR Review'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Optional Gemini Assist Feedback Panel (shared across Tools 2, 3, 4) */}
      {aiResponse && (
        <div
          className={`rounded-xl border p-5 text-sm ${
            aiResponse.aiAvailable
              ? 'border-blue-200 bg-blue-50/50 text-slate-800'
              : 'border-amber-200 bg-amber-50 text-amber-900'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold">
              {aiResponse.aiAvailable ? (
                <Sparkles className="h-4 w-4 text-blue-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-700" />
              )}
              <span>
                {aiResponse.aiAvailable
                  ? `Optional Gemini Feedback (${aiResponse.modelName})`
                  : 'Optional AI Unavailable — Browser-Local Mode Active'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAiResponse(null)}
              className="text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          {aiResponse.errorMessage && <p className="mt-2 text-xs">{aiResponse.errorMessage}</p>}
          {aiResponse.suggestions.length > 0 && (
            <ul className="mt-3 list-disc pl-5 space-y-1 text-xs">
              {aiResponse.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}
          {aiResponse.polishedText && (
            <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-blue-200 bg-white p-3 font-sans text-xs text-slate-800">
              {aiResponse.polishedText}
            </pre>
          )}
          <p className="mt-3 text-[11px] text-slate-500">{aiResponse.disclaimer}</p>
        </div>
      )}

      {/* 5. SALARY CALCULATOR */}
      {activeTool === 'salary-calculator' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              Salary &amp; Take-Home Estimate Calculator
            </h3>
            <p className="text-xs text-slate-600">
              Model approximate net pay after effective tax and retirement/savings deductions.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
              <select
                value={salaryCurrency}
                onChange={(e) => setSalaryCurrency(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Gross</label>
              <input
                type="number"
                min={0}
                value={grossAnnual}
                onChange={(e) => setGrossAnnual(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Effective Tax (%)
              </label>
              <input
                type="number"
                min={0}
                max={65}
                value={estTaxPercent}
                onChange={(e) => setEstTaxPercent(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Retirement / PF (%)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={retirementPercent}
                onChange={(e) => setRetirementPercent(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Estimated Monthly Take-Home</p>
              <p className="mt-1 font-mono-tabular text-2xl font-bold text-blue-700">
                {salaryCurrency} {Math.round(netMonthly).toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Estimated Annual Take-Home</p>
              <p className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
                {salaryCurrency} {Math.round(netAnnual).toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Annual Tax + Deductions</p>
              <p className="mt-1 font-mono-tabular text-2xl font-bold text-slate-700">
                {salaryCurrency} {Math.round(taxAmt + retireAmt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. HOURLY-TO-MONTHLY CONVERTER */}
      {activeTool === 'hourly-converter' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <h3 className="font-display text-lg font-bold text-slate-900">
            Hourly-to-Monthly &amp; Annual Salary Converter
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hourly Rate
              </label>
              <input
                type="number"
                min={0}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hours / Week
              </label>
              <input
                type="number"
                min={1}
                max={80}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Working Weeks / Year
              </label>
              <input
                type="number"
                min={1}
                max={52}
                value={weeksPerYear}
                onChange={(e) => setWeeksPerYear(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Weekly Gross</p>
              <p className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
                {weeklyGross.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Average Monthly Gross</p>
              <p className="mt-1 font-mono-tabular text-2xl font-bold text-blue-700">
                {Math.round(monthlyFromHourly).toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Annual Gross</p>
              <p className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
                {Math.round(annualFromHourly).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7 & 8. SKILLS GAP CHECKLIST & CAREER PATH EXPLORER */}
      {(activeTool === 'skills-gap' || activeTool === 'career-paths') && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                {activeTool === 'skills-gap' ? 'Skills Gap Checklist' : 'Career Path Explorer'}
              </h3>
              <p className="text-xs text-slate-600">
                Select a career track to audit core entry-level competencies and access free verified study portals.
              </p>
            </div>
            <select
              value={selectedCareerPath}
              onChange={(e) => setSelectedCareerPath(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold"
            >
              {Object.keys(CAREER_PATHS_DATA).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
            <p className="text-sm font-medium text-slate-800">{pathInfo.overview}</p>
            <p className="text-xs text-slate-600">
              <span className="font-semibold">Typical Entry Roles:</span>{' '}
              {pathInfo.entryRoles.join(' · ')}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Core Skills Checklist</span>
              <span>
                {checkedCount} / {pathInfo.coreSkills.length} completed
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {pathInfo.coreSkills.map((skill) => (
                <label
                  key={skill}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 hover:border-blue-400 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(checkedSkills[skill])}
                    onChange={(e) =>
                      setCheckedSkills((prev) => ({ ...prev, [skill]: e.target.checked }))
                    }
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-3 text-xs">
            <span className="font-semibold text-slate-700">Free Official Study Resources:</span>
            {pathInfo.freeResources.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-700 underline hover:text-blue-900"
              >
                {r.title} ↗
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 9 & 10. JOB APPLICATION TRACKER & INTERNSHIP APPLICATION TRACKER */}
      {(activeTool === 'job-tracker' || activeTool === 'internship-tracker') && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              {trackerKind === 'internship'
                ? 'Internship Application Tracker'
                : 'Job Application Tracker'}{' '}
              (Saved Privately in Your Browser)
            </h3>
            <p className="text-xs text-slate-600">
              Add applications directly from listing cards using &ldquo;+ Track&rdquo; or enter them manually below. Zero login required.
            </p>
          </div>

          <form
            onSubmit={handleAddTrackerItem}
            className="grid grid-cols-1 gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-6"
          >
            <input
              type="text"
              required
              value={trkTitle}
              onChange={(e) => setTrkTitle(e.target.value)}
              placeholder={trackerKind === 'internship' ? 'Internship Role' : 'Job Title'}
              className="sm:col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
            <input
              type="text"
              required
              value={trkOrg}
              onChange={(e) => setTrkOrg(e.target.value)}
              placeholder="Company / Institution"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={trkLoc}
              onChange={(e) => setTrkLoc(e.target.value)}
              placeholder="Location / Remote"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={trkSalary}
              onChange={(e) => setTrkSalary(e.target.value)}
              placeholder={trackerKind === 'internship' ? 'Stipend (Optional)' : 'Salary (Optional)'}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </form>

          {filteredApps.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              No {trackerKind} applications tracked yet. Use &ldquo;+ Track&rdquo; on any live listing or add one above.
            </p>
          ) : (
            <div className="space-y-2.5">
              {filteredApps.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-sm text-slate-900">
                      {entry.title} — <span className="text-blue-700">{entry.organization}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {entry.location}
                      {entry.stipendOrSalary ? ` · ${entry.stipendOrSalary}` : ''}
                      {entry.deadline ? ` · Deadline: ${entry.deadline}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={entry.status}
                      onChange={(e) =>
                        handleUpdateTrackerStatus(
                          entry.id,
                          e.target.value as ApplicationTrackerEntry['status']
                        )
                      }
                      className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium"
                    >
                      <option value="Saved">Saved</option>
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <button
                      type="button"
                      aria-label={`Remove ${entry.title}`}
                      onClick={() => handleDeleteTrackerItem(entry.id)}
                      className="rounded border border-slate-200 p-1.5 text-slate-500 hover:border-red-300 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
