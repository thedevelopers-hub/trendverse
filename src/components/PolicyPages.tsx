import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { AppRoute, PolicyPageId } from '../types/editorial';
import { EDITORIAL_WORKFLOW_STEPS, FOUNDER_BRAND_IDENTITY, POLICY_PAGES } from '../data/workflowAndPolicies';

interface PolicyPagesProps {
  pageId: PolicyPageId;
  onNavigate: (route: AppRoute) => void;
}

export const PolicyPages: React.FC<PolicyPagesProps> = ({ pageId, onNavigate }) => {
  const page = POLICY_PAGES[pageId];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Editorial Correction');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || message.trim().length < 10) {
      setFormError('Please provide your name, a valid email address, and a message of at least 10 characters.');
      return;
    }
    setFormError('');
    setSubmitted(true);
  };

  return (
    <div>
      <section className="bg-[#0b1324] text-white border-b border-white/10 py-12">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400 mb-3">
            <button
              type="button"
              onClick={() => onNavigate({ view: 'home' })}
              className="hover:text-white cursor-pointer"
            >
              Home
            </button>{' '}
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

          {(pageId === 'about' || pageId === 'editorial-policy') && (
            <section
              aria-label="Founder and Publisher Profile"
              className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col gap-5 sm:flex-row sm:items-center"
            >
              {/* Optional profile image container — shows crisp editorial monogram unless replaced with a custom Blogger/CDN portrait URL */}
              <div
                aria-hidden="true"
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-[#0b1324] font-display text-3xl font-bold text-white"
              >
                V
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Founder Profile &amp; Website Credits
                </p>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  {FOUNDER_BRAND_IDENTITY.founderName} — Founder &amp; Developer
                </h2>
                <p className="text-xs font-medium text-slate-600">
                  Publisher: {FOUNDER_BRAND_IDENTITY.publisherName} · {FOUNDER_BRAND_IDENTITY.brandName} ({FOUNDER_BRAND_IDENTITY.tagline})
                </p>
                <p className="text-sm leading-relaxed text-slate-700">
                  {FOUNDER_BRAND_IDENTITY.platformNote}
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
              <h2 className="font-display text-xl font-semibold text-slate-900 mb-4">
                Send a Note to the Editorial Desk
              </h2>
              {submitted ? (
                <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-slate-800">
                  <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">Message validated locally</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Connect your Blogger Contact Form gadget or static form endpoint in production
                      to route reader inquiries to your editorial inbox.
                    </p>
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
                      Topic
                    </label>
                    <select
                      id="contact-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
                    >
                      <option>Editorial Correction</option>
                      <option>Technical / Accessibility Feedback</option>
                      <option>General Inquiry</option>
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
                    Submit Inquiry
                  </button>
                </form>
              )}
            </section>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Institutional Pages
            </h3>
            <ul className="space-y-2 text-sm">
              {(Object.keys(POLICY_PAGES) as PolicyPageId[]).map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onNavigate({ view: 'policy', pageId: id })}
                    className={`w-full rounded-lg px-3 py-2 text-left transition-colors cursor-pointer ${
                      id === pageId
                        ? 'bg-white font-semibold text-blue-600 shadow-sm'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    {POLICY_PAGES[id].title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};
