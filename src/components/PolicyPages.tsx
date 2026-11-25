import React, { useState } from 'react';
import { Check, ExternalLink, Mail, MessageCircle, SlidersHorizontal } from 'lucide-react';
import { AppRoute, PolicyPageId } from '../types/editorial';
import { EDITORIAL_WORKFLOW_STEPS, FOUNDER_BRAND_IDENTITY, POLICY_PAGES } from '../data/workflowAndPolicies';
import { openConsentPreferences } from '../utils/consent';
import { routeToUrl } from '../utils/routes';
import { trackFormSubmit } from '../utils/thirdPartyScripts';

interface PolicyPagesProps {
  pageId: PolicyPageId;
  onNavigate: (route: AppRoute) => void;
}

const CONTACT_TOPICS = [
  'General Enquiry',
  'Editorial Feedback',
  'Corrections & Factual Error Reporting',
  'Business & Partnership Enquiry',
] as const;

export const PolicyPages: React.FC<PolicyPagesProps> = ({ pageId, onNavigate }) => {
  const page = POLICY_PAGES[pageId];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState<string>(CONTACT_TOPICS[0]);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSpaNav = (e: React.MouseEvent, route: AppRoute) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(route);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || message.trim().length < 10) {
      setFormError('Please provide your name, a valid email address, and a message of at least 10 characters.');
      return;
    }
    setFormError('');
    setSubmitted(true);
    trackFormSubmit({
      formName: 'contact_message',
      formLocation: 'contact_page',
      formCategory: subject,
    });
  };

  const composedEmailBody = `Name: ${name.trim()}\nReply Email: ${email.trim()}\nTopic: ${subject}\n\n${message.trim()}`;
  const mailtoHref = `mailto:${FOUNDER_BRAND_IDENTITY.contactEmail}?subject=${encodeURIComponent(
    `[TRENDVERSE] ${subject}`
  )}&body=${encodeURIComponent(composedEmailBody)}`;
  const whatsappComposeHref = `${FOUNDER_BRAND_IDENTITY.whatsappUrl}?text=${encodeURIComponent(
    `Hello TRENDVERSE (${subject}) — From ${name.trim()} (${email.trim()}): ${message.trim()}`
  )}`;

  return (
    <div>
      <section className="bg-[#0b1324] text-white border-b border-white/10 py-12">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400 mb-3">
            <a
              href="/"
              onClick={(e) => handleSpaNav(e, { view: 'home' })}
              className="hover:text-white cursor-pointer"
            >
              Home
            </a>{' '}
            / <span className="text-slate-200">{page.title}</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white">
            {page.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-300">{page.subtitle}</p>
          <p className="mt-4 text-xs text-slate-400">Last updated: {page.lastUpdated}</p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-8">
          {pageId === 'contact' && (
            <section aria-label="Direct official contact channels" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>Official Email</span>
                </div>
                <h2 className="mt-2 font-display text-lg font-semibold text-slate-900">
                  Editorial &amp; Business Inbox
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  For general enquiries, editorial feedback, corrections, and partnership requests.
                </p>
                <a
                  href={`mailto:${FOUNDER_BRAND_IDENTITY.contactEmail}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline break-all"
                >
                  <span>{FOUNDER_BRAND_IDENTITY.contactEmail}</span>
                </a>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span>WhatsApp Direct</span>
                </div>
                <h2 className="mt-2 font-display text-lg font-semibold text-slate-900">
                  Direct WhatsApp Line
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Message TRENDVERSE directly on WhatsApp for quick editorial notes or enquiries.
                </p>
                <a
                  href={FOUNDER_BRAND_IDENTITY.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
                >
                  <span>{FOUNDER_BRAND_IDENTITY.whatsappDisplay}</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </section>
          )}

          {page.sections.map((sec) => (
            <section key={sec.heading} className="space-y-3 max-w-prose">
              <h2 className="font-display text-2xl font-semibold text-slate-900">{sec.heading}</h2>
              {sec.body.map((para, i) => (
                <p key={i} className="text-base leading-relaxed text-slate-700">
                  {para}
                </p>
              ))}
            </section>
          ))}

          {pageId === 'privacy-policy' && (
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-6 max-w-prose">
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Manage Your Consent Preferences
              </h2>
              <p className="mt-1.5 text-sm text-slate-600">
                Update or withdraw consent for optional analytics and advertising partners at any
                time.
              </p>
              <button
                type="button"
                onClick={() => openConsentPreferences()}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Open Privacy &amp; Cookie Settings</span>
              </button>
            </section>
          )}

          {(pageId === 'about' || pageId === 'editorial-policy' || pageId === 'corrections-policy') && (
            <section
              aria-label="Founder and Publisher Profile"
              className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col gap-5 sm:flex-row sm:items-center"
            >
              <div
                aria-hidden="true"
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-[#0b1324] font-display text-3xl font-bold text-white"
              >
                V
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Founder Profile &amp; Website Ownership
                </p>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  {FOUNDER_BRAND_IDENTITY.founderName} — Founder, Developer &amp; Managing Editor
                </h2>
                <p className="text-xs font-medium text-slate-600">
                  Publisher: {FOUNDER_BRAND_IDENTITY.publisherName} · {FOUNDER_BRAND_IDENTITY.brandName} ({FOUNDER_BRAND_IDENTITY.tagline})
                </p>
                <p className="text-sm leading-relaxed text-slate-700">
                  {FOUNDER_BRAND_IDENTITY.platformNote}
                </p>
                <p className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>
                    Email:{' '}
                    <a
                      href={`mailto:${FOUNDER_BRAND_IDENTITY.contactEmail}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {FOUNDER_BRAND_IDENTITY.contactEmail}
                    </a>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    WhatsApp:{' '}
                    <a
                      href={FOUNDER_BRAND_IDENTITY.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {FOUNDER_BRAND_IDENTITY.whatsappDisplay}
                    </a>
                  </span>
                </p>
              </div>
            </section>
          )}

          {pageId === 'editorial-policy' && (
            <section className="pt-4 space-y-4">
              <h2 className="font-display text-2xl font-semibold text-slate-900">
                Nine-Stage Editorial Production Pipeline
              </h2>
              <div className="space-y-3">
                {EDITORIAL_WORKFLOW_STEPS.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono-tabular font-semibold text-blue-600">
                        {step.stepNumber}. {step.owner}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {pageId === 'contact' && (
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-display text-xl font-semibold text-slate-900 mb-2">
                Prepare a Direct Message
              </h2>
              <p className="text-xs text-slate-600 mb-4">
                Draft your enquiry below and send it directly through your email application or WhatsApp.
              </p>
              {submitted ? (
                <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-slate-800">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Your message is ready to send</p>
                      <p className="mt-1 text-xs text-slate-600">
                        Choose an official channel below to deliver your {subject.toLowerCase()} directly to TRENDVERSE.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={mailtoHref}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Send via Email ({FOUNDER_BRAND_IDENTITY.contactEmail})</span>
                    </a>
                    <a
                      href={whatsappComposeHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                      <span>Send via WhatsApp ({FOUNDER_BRAND_IDENTITY.whatsappDisplay})</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 underline cursor-pointer"
                    >
                      Edit message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} noValidate className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-medium text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-medium text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact-subject" className="block text-xs font-medium text-slate-700 mb-1">
                      Enquiry Category
                    </label>
                    <select
                      id="contact-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
                    >
                      {CONTACT_TOPICS.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="contact-msg" className="block text-xs font-medium text-slate-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="contact-msg"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  {formError && (
                    <p role="alert" className="text-xs font-medium text-amber-700">
                      {formError}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors cursor-pointer"
                  >
                    Prepare Message
                  </button>
                </form>
              )}
            </section>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Institutional Pages
            </h2>
            <ul className="space-y-2 text-sm">
              {(Object.keys(POLICY_PAGES) as PolicyPageId[]).map((id) => {
                const route: AppRoute = { view: 'policy', pageId: id };
                return (
                  <li key={id}>
                    <a
                      href={routeToUrl(route)}
                      onClick={(e) => handleSpaNav(e, route)}
                      className={`block w-full rounded-lg px-3 py-2 text-left transition-colors cursor-pointer ${
                        id === pageId
                          ? 'bg-white font-semibold text-blue-600 shadow-sm'
                          : 'text-slate-700 hover:bg-white'
                      }`}
                    >
                      {POLICY_PAGES[id].title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

