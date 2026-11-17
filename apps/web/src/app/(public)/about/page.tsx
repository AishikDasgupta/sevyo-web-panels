import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CARE_SERVICES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Sevyo connects families with verified healthcare professionals — nurses, attendants, physiotherapists, mental health experts, labs, and equipment providers.',
};

const VALUES = [
  {
    icon: '🎯',
    title: 'Our Mission',
    desc: 'To make trusted medical care accessible to every family — within minutes, with verified professionals, and with zero waiting rooms.',
  },
  {
    icon: '🔭',
    title: 'Our Vision',
    desc: 'A world where healthcare meets people where they are — at home, at the office, or at site — safely and with dignity.',
  },
  {
    icon: '❤️',
    title: 'Our Values',
    desc: 'Verified professionals, transparent pricing, on-time arrival, and compassion in everything we do.',
  },
];

const STATS = [
  { value: '500+', label: 'Verified Professionals' },
  { value: '10K+', label: 'Care Visits Delivered' },
  { value: '4.8★', label: 'Average Rating' },
  { value: '6', label: 'Care Categories' },
];

export default function AboutPage() {
  return (
    <div>
      {/* HERO */}
      <section
        className="px-6 py-24"
        style={{ background: 'linear-gradient(to bottom, hsl(220 72% 41% / .06), hsl(180 20% 99%))' }}
      >
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[.1em] text-primary">
            About Sevyo
          </span>
          <h1 className="mt-6 text-4xl leading-[1.1] sm:text-5xl">
            Care That Comes
            <br />
            <span className="text-primary">To You</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Sevyo connects families with verified healthcare professionals — nurses, attendants, physiotherapists,
            mental health experts, labs, and equipment providers — so that world-class care happens at home or
            wherever it is needed.
          </p>
        </div>
      </section>

      {/* MISSION / VISION / VALUES */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="h-full rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-4 text-3xl">{v.icon}</div>
                <h3 className="mb-2 text-lg">{v.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section
        className="px-6 py-20"
        style={{ background: 'linear-gradient(to bottom, hsl(220 72% 41% / .04), hsl(180 20% 99%))' }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-heading text-4xl font-extrabold text-primary">{s.value}</p>
                <p className="mt-1 text-sm font-semibold text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES OVERVIEW */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[.1em] text-accent">
              What We Do
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl">One Platform, Complete Care</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CARE_SERVICES.map((service) => (
              <Link
                key={service.label}
                href="/auth?mode=signup"
                className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-white hover:shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  {service.icon}
                </div>
                <p className="font-bold" style={{ fontSize: '0.95rem' }}>
                  {service.label}
                </p>
                <p className="flex-1 text-xs leading-relaxed text-slate-500">{service.desc}</p>
                <span className="self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {service.site ? '🏠 At Home · 🏢 At Site' : '🏠 At Home'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div
            className="relative overflow-hidden rounded-3xl p-14 text-center shadow-lg lg:p-20"
            style={{ background: 'linear-gradient(135deg, hsl(220 72% 47%), hsl(220 72% 41%))' }}
          >
            <h2 className="text-4xl text-white lg:text-5xl">Ready for Care at Your Doorstep?</h2>
            <p className="mt-3 text-lg text-white/80">Book a verified professional in minutes.</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-slate-100">
                <Link href="/auth?mode=signup">⚡ Book Now</Link>
              </Button>
              <Button asChild size="lg" className="border border-white/30 bg-white/15 text-white hover:bg-white/25">
                <Link href="/auth">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}