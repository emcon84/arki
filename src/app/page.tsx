'use client'

import {
  MessageSquare,
  Search,
  FileText,
  Clock,
  Users,
  CheckCircle,
  Bot,
  LayoutDashboard,
  Download,
  ArrowRight,
  Layers,
  Terminal,
} from 'lucide-react'
import { LandingNav } from '@/components/nav/LandingNav'
import { StartSessionButton } from '@/components/landing/StartSessionButton'
import { RecentSessions } from '@/components/landing/RecentSessions'
import { useTranslations } from '@/i18n/useTranslations'

export default function HomePage() {
  const { t } = useTranslations()

  return (
    <div className="min-h-screen bg-white text-[#111111] dark:bg-black dark:text-[#ededed]">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-32 text-center md:py-40">
        {/* Subtle radial gradient background accent */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,0,0,0.04), transparent)',
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-[#fafafa] px-4 py-1.5 text-xs font-medium text-[#666666] dark:border-white/10 dark:bg-[#111111] dark:text-[#888888]">
            <Layers className="h-3 w-3" />
            Software Architecture AI
          </div>

          <h1
            className="mb-6 text-6xl font-bold tracking-tighter text-[#111111] dark:text-[#ededed] sm:text-8xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Arki
          </h1>

          <p className="mb-4 text-2xl font-medium text-[#666666] dark:text-[#888888]">
            {t.landing.tagline}
          </p>

          <p className="mb-12 text-lg leading-relaxed text-[#666666] dark:text-[#888888]">
            {t.landing.description}
          </p>

          <StartSessionButton />
          <RecentSessions />
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-6xl px-6">
        <hr className="border-black/[0.08] dark:border-white/10" />
      </div>

      {/* Problem / Solution */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-3xl font-semibold tracking-tight text-[#111111] dark:text-[#ededed]">
            {t.landing.problemTitle}
          </h2>
          <p className="mb-16 text-lg leading-relaxed text-[#666666] dark:text-[#888888]">
            {t.landing.problemDesc}
          </p>

          <div className="space-y-4">
            <div className="rounded-xl border border-black/[0.08] bg-[#fafafa] p-6 dark:border-white/[0.08] dark:bg-[#111111]">
              <p className="mb-4 text-xs font-mono font-semibold uppercase tracking-widest text-[#888888]">
                {t.landing.problemFlowBrokenLabel}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  t.landing.problemFlowStep1,
                  t.landing.problemFlowStep2,
                  t.landing.problemFlowStep3Broken,
                ].map((step, i, arr) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className="rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-sm text-[#666666] dark:border-white/10 dark:bg-[#1a1a1a] dark:text-[#888888]">
                      {step}
                    </span>
                    {i < arr.length - 1 && (
                      <ArrowRight className="h-3 w-3 flex-shrink-0 text-[#888888]" strokeWidth={2} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-black/[0.15] bg-white p-6 dark:border-white/[0.15] dark:bg-[#0a0a0a]">
              <p className="mb-4 text-xs font-mono font-semibold uppercase tracking-widest text-[#111111] dark:text-[#ededed]">
                {t.landing.problemFlowArkiLabel}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  t.landing.problemFlowStep1,
                  'Arki',
                  t.landing.problemFlowStep3Arki,
                  t.landing.problemFlowStep2,
                  t.landing.problemFlowStep4,
                ].map((step, i, arr) => (
                  <div key={`${step}-${i}`} className="flex items-center gap-2">
                    <span className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                      step === 'Arki'
                        ? 'border-black/20 bg-[#111111] text-white dark:border-white/20 dark:bg-white dark:text-black'
                        : 'border-black/[0.08] bg-[#fafafa] text-[#111111] dark:border-white/10 dark:bg-[#111111] dark:text-[#ededed]'
                    }`}>
                      {step}
                    </span>
                    {i < arr.length - 1 && (
                      <ArrowRight className="h-3 w-3 flex-shrink-0 text-[#888888]" strokeWidth={2} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 border-l-2 border-black/20 pl-6 dark:border-white/20">
            <p className="mb-2 text-lg font-semibold text-[#111111] dark:text-[#ededed]">
              {t.landing.problemInsight}
            </p>
            <p className="text-[#666666] dark:text-[#888888]">
              {t.landing.problemInsightDesc}
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-6xl px-6">
        <hr className="border-black/[0.08] dark:border-white/10" />
      </div>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="mb-16 text-center text-3xl font-semibold tracking-tight text-[#111111] dark:text-[#ededed]">
          {t.landing.howItWorksTitle}
        </h2>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {[
            {
              icon: MessageSquare,
              step: '01',
              title: t.landing.step1Title,
              desc: t.landing.step1Desc,
            },
            {
              icon: Search,
              step: '02',
              title: t.landing.step2Title,
              desc: t.landing.step2Desc,
            },
            {
              icon: FileText,
              step: '03',
              title: t.landing.step3Title,
              desc: t.landing.step3Desc,
            },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="flex flex-col gap-4">
              <span className="font-mono text-xs font-bold text-[#888888]">
                {step}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/[0.08] bg-[#fafafa] dark:border-white/10 dark:bg-[#111111]">
                <Icon
                  className="h-5 w-5 text-[#111111] dark:text-[#ededed]"
                  strokeWidth={2}
                />
              </div>
              <div>
                <h3 className="mb-2 text-base font-semibold text-[#111111] dark:text-[#ededed]">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-[#666666] dark:text-[#888888]">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-6xl px-6">
        <hr className="border-black/[0.08] dark:border-white/10" />
      </div>

      {/* Why Arki */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="mb-16 text-center text-3xl font-semibold tracking-tight text-[#111111] dark:text-[#ededed]">
          {t.landing.whyTitle}
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: Clock,
              title: t.landing.why1Title,
              desc: t.landing.why1Desc,
            },
            {
              icon: Users,
              title: t.landing.why2Title,
              desc: t.landing.why2Desc,
            },
            {
              icon: CheckCircle,
              title: t.landing.why3Title,
              desc: t.landing.why3Desc,
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-black/[0.08] bg-[#fafafa] p-6 dark:border-white/[0.12] dark:bg-[#111111]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-black/[0.06] dark:bg-white/[0.08]">
                <Icon className="h-5 w-5 text-[#111111] dark:text-[#ededed]" strokeWidth={2} />
              </div>
              <h3 className="mb-2 text-base font-semibold text-[#111111] dark:text-[#ededed]">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-[#666666] dark:text-[#888888]">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-6xl px-6">
        <hr className="border-black/[0.08] dark:border-white/10" />
      </div>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="mb-16 text-center text-3xl font-semibold tracking-tight text-[#111111] dark:text-[#ededed]">
          {t.landing.featuresTitle}
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[
            {
              icon: Bot,
              title: t.landing.feature1Title,
              desc: t.landing.feature1Desc,
            },
            {
              icon: LayoutDashboard,
              title: t.landing.feature2Title,
              desc: t.landing.feature2Desc,
            },
            {
              icon: Download,
              title: t.landing.feature3Title,
              desc: t.landing.feature3Desc,
            },
            {
              icon: Terminal,
              title: t.landing.feature4Title,
              desc: t.landing.feature4Desc,
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-xl border border-black/[0.08] bg-[#fafafa] p-6 dark:border-white/[0.12] dark:bg-[#111111]"
            >
              <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-black/[0.06] dark:bg-white/[0.08]">
                <Icon
                  className="h-4 w-4 text-[#111111] dark:text-[#ededed]"
                  strokeWidth={2}
                />
              </div>
              <div>
                <h3 className="mb-1 text-base font-semibold text-[#111111] dark:text-[#ededed]">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-[#666666] dark:text-[#888888]">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[0.08] dark:border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#111111] dark:bg-white">
              <Layers className="h-3 w-3 text-white dark:text-black" strokeWidth={2} />
            </div>
            <span className="text-sm font-medium text-[#111111] dark:text-[#ededed]">
              Arki
            </span>
          </div>
          <p className="text-xs text-[#888888]">
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}
