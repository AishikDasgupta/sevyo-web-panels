import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bandage,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Droplets,
  FlaskConical,
  HandHeart,
  HeartHandshake,
  HeartPulse,
  MapPin,
  MessageCircleQuestion,
  MousePointerClick,
  Navigation,
  Package,
  Pill,
  Quote,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Syringe,
  TestTube2,
  Timer,
  Users,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { CARE_SERVICES } from '@/lib/constants';
import { initials } from '@/lib/format';
import type { Service } from '@sevyo/shared-types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Stars } from '@/components/stars';
import { Reveal } from '@/components/reveal';

export const metadata: Metadata = {
  title: 'Professional Care at Home',
  description:
    'Book trusted nurses, attendants, and home healthcare professionals for your loved ones — within minutes, no waiting rooms.',
};

export const dynamic = 'force-dynamic';

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const INSTANT_ICONS: Record<string, { icon: LucideIcon; tile: string }> = {
  'IV Cannulation': { icon: Syringe, tile: 'bg-sky-50 text-sky-600 ring-sky-100' },
  'IM / SC Injection': { icon: Syringe, tile: 'bg-sky-50 text-sky-600 ring-sky-100' },
  'IV Injection': { icon: Syringe, tile: 'bg-sky-50 text-sky-600 ring-sky-100' },
  'Multi-Vitamin IV': { icon: Pill, tile: 'bg-amber-50 text-amber-600 ring-amber-100' },
  'Electrolyte IV (NS/RL/DNS)': { icon: Droplets, tile: 'bg-cyan-50 text-cyan-600 ring-cyan-100' },
  'Major Dressing': { icon: Bandage, tile: 'bg-rose-50 text-rose-600 ring-rose-100' },
  'Minor Wound Dressing': { icon: Bandage, tile: 'bg-rose-50 text-rose-600 ring-rose-100' },
  'Diabetic Foot Ulcer Dressing': { icon: HeartPulse, tile: 'bg-rose-50 text-rose-600 ring-rose-100' },
  "Foley's Catheter Remove": { icon: Wind, tile: 'bg-violet-50 text-violet-600 ring-violet-100' },
  "Foley's Catheter Insert": { icon: Wind, tile: 'bg-violet-50 text-violet-600 ring-violet-100' },
  "Ryle's Tube": { icon: FlaskConical, tile: 'bg-violet-50 text-violet-600 ring-violet-100' },
  'Enema Service': { icon: Stethoscope, tile: 'bg-violet-50 text-violet-600 ring-violet-100' },
  'Bedsore Dressing': { icon: Bandage, tile: 'bg-rose-50 text-rose-600 ring-rose-100' },
  'Albumin Injection': { icon: Droplets, tile: 'bg-cyan-50 text-cyan-600 ring-cyan-100' },
  'Suture Removal / Care': { icon: Scissors, tile: 'bg-orange-50 text-orange-600 ring-orange-100' },
  'Antibiotic IV': { icon: Syringe, tile: 'bg-emerald-50 text-emerald-600 ring-emerald-100' },
};

const DEFAULT_INSTANT_ICON = { icon: Stethoscope, tile: 'bg-slate-100 text-slate-600 ring-slate-200' };

const FALLBACK_INSTANT_SERVICES = Object.keys(INSTANT_ICONS);

async function getInstantServiceNames(): Promise<string[]> {
  try {
    const services = await api.get<Service[]>('/services');
    const instant = services
      .filter((s) => s.category === 'instant' && s.isActive)
      .map((s) => s.name);
    return instant.length > 0 ? instant : FALLBACK_INSTANT_SERVICES;
  } catch {
    return FALLBACK_INSTANT_SERVICES;
  }
}

const CARE_ICONS: Record<string, LucideIcon> = {
  Attendants: HandHeart,
  Nurses: Stethoscope,
  Physiotherapists: Activity,
  'Mental Health': Brain,
  Labs: TestTube2,
  'Equipment Providers': Package,
};

const STEPS = [
  {
    icon: MousePointerClick,
    n: '01',
    title: 'Choose your service',
    desc: 'Pick from verified at-home procedures — IV drips, dressings, injections and more.',
  },
  {
    icon: Users,
    n: '02',
    title: 'We match a nurse',
    desc: 'We find a licensed, background-verified nurse near you within minutes — no apps, no hassle.',
  },
  {
    icon: HeartHandshake,
    n: '03',
    title: 'Care at your doorstep',
    desc: 'A professional arrives and delivers safe, dignified care. No waiting rooms, no commutes.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'I needed an IV drip after a fever and a nurse arrived within 30 minutes. Absolutely seamless experience!',
    name: 'Priya Sharma',
    location: 'Mumbai, MH',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
  {
    quote: 'My father needed daily dressing changes post-surgery. Sevyo made it so easy — professional and caring.',
    name: 'Rahul Mehta',
    location: 'Delhi, IN',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    quote: 'From booking to the nurse arriving, it took under 45 minutes. This service is a game changer.',
    name: 'Anita Nair',
    location: 'Bengaluru, KA',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
];

const FAQS = [
  {
    q: 'How quickly can a nurse arrive?',
    a: 'For most metro areas, we typically have a trained nurse at your doorstep within 30–60 minutes of booking confirmation.',
  },
  {
    q: 'Are your nurses certified and verified?',
    a: 'All nurses and healthcare professionals are licensed, background-checked, and verified by our clinical team before being onboarded.',
  },
  {
    q: 'Can I book for a family member?',
    a: 'Absolutely. You can book on behalf of any family member by providing their details during the booking flow.',
  },
  {
    q: 'What if I need to cancel or reschedule?',
    a: 'You can cancel or reschedule up to 30 minutes before the scheduled visit with no charge.',
  },
];

const MARQUEE_ITEMS = [
  'IV Cannulation', 'Wound Dressing', 'Home Nursing', 'Physiotherapy', 'Elder Care',
  'Lab Sample Collection', 'Mental Health Support', 'Pediatric Care', 'Dementia Care',
  'Post-surgery Care', 'Diabetic Monitoring', 'Equipment Providers',
];

const STATS = [
  { value: '500+', label: 'Verified professionals', icon: ShieldCheck },
  { value: '10K+', label: 'Care visits delivered', icon: ClipboardCheck },
  { value: '4.8', label: 'Average rating', icon: Star },
  { value: '6', label: 'Care categories', icon: Users },
];

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function SectionHeading({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-10 text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        {badge}
      </span>
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

function StarsRow({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <div className="flex gap-0.5 text-amber-400" aria-label="5 stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={className} fill="currentColor" strokeWidth={0} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function HomePage() {
  const instantServices = await getInstantServiceNames();

  return (
    <div className="overflow-hidden">
      {/* ============ HERO ============ */}
      <section className="relative bg-blueprint px-6 pb-20 pt-16 lg:pb-28 lg:pt-20">
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary/10 blur-[130px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-accent/10 blur-[130px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              Accepting bookings near you
            </span>

            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Medical care,
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-900 to-accent bg-clip-text text-transparent">
                delivered in minutes
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground lg:mx-0">
              Book licensed nurses, attendants, physiotherapists and more — they arrive at your door, verified and
              rated, often within 30 minutes.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button asChild size="lg" className="btn-shine rounded-xl px-7 text-base shadow-lg shadow-primary/25">
                <Link href="/auth?mode=signup">
                  ⚡ Book a nurse now
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl bg-white/80 px-7 text-base backdrop-blur">
                <Link href="#services">Explore services</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground lg:justify-start">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Verified only
              </span>
              <span className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" /> 30-min arrival
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> At home or at site
              </span>
            </div>
          </div>

          {/* Live booking mock — pure CSS artwork */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden>
            <div className="animate-hero-float rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Syringe className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">IV Cannulation</p>
                    <p className="text-[0.65rem] text-muted-foreground">Instant booking · ₹500</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-amber-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                  En route
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  { label: 'Booking confirmed', done: true },
                  { label: 'Nurse assigned', done: true },
                  { label: 'Nurse on the way', done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {step.done ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" fill="currentColor" stroke="white" />
                    ) : (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                        <div className="h-3 w-3 animate-ping rounded-full bg-primary/60" />
                      </div>
                    )}
                    <span className={step.done ? 'text-xs font-medium text-slate-600' : 'text-xs font-semibold text-primary'}>
                      {step.label}
                    </span>
                    {i === 1 && <span className="ml-auto text-[0.65rem] text-muted-foreground">9:42 pm</span>}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-900 text-sm font-bold text-white">
                  SJ
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold">Sarah Johnson, RN</p>
                  <p className="text-[0.65rem] text-muted-foreground">8 yrs exp · 4.9 ★ · Wound & IV therapy</p>
                </div>
                <div className="rounded-xl bg-emerald-100 px-2.5 py-1.5 text-center">
                  <p className="text-sm font-extrabold leading-none text-emerald-700">12</p>
                  <p className="text-[0.6rem] font-bold uppercase text-emerald-700">min</p>
                </div>
              </div>
            </div>

            {/* Floating chips */}
            <div className="animate-hero-float-late absolute -right-3 top-6 hidden items-center gap-2 rounded-2xl border border-slate-100 bg-white/95 px-3 py-2 shadow-lg backdrop-blur sm:flex">
              <BadgeCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-[0.7rem] font-bold leading-tight">Verified nurse</p>
                <p className="text-[0.6rem] text-muted-foreground">License & background checked</p>
              </div>
            </div>
            <div className="animate-hero-float absolute -left-3 bottom-16 hidden items-center gap-2 rounded-2xl border border-slate-100 bg-white/95 px-3 py-2 shadow-lg backdrop-blur sm:flex" style={{ animationDelay: '0.8s' }}>
              <Star className="h-5 w-5 text-amber-400" fill="currentColor" />
              <div>
                <p className="text-[0.7rem] font-bold leading-tight">4.9 rated</p>
                <p className="text-[0.6rem] text-muted-foreground">10K+ visits completed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SERVICES MARQUEE ============ */}
      <div className="marquee-paused border-y border-slate-100 bg-white py-3" aria-hidden>
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              {item}
              <span className="text-primary/40">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ============ INSTANT SERVICES ============ */}
      <section id="services" className="bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              badge="Available Now"
              title="Booked in seconds, delivered at home"
              subtitle="Every service is performed by trained, certified nursing professionals — flat ₹500, or priced per hour for longer care."
            />
          </Reveal>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {instantServices.map((name) => {
              const { icon: Icon, tile } = INSTANT_ICONS[name] ?? DEFAULT_INSTANT_ICON;
              return (
                <Link
                  key={name}
                  href="/auth?mode=signup"
                  className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:bg-white hover:shadow-lg"
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110 ${tile}`}>
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <span className="text-[0.72rem] font-semibold leading-snug text-slate-700">{name}</span>
                </Link>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="btn-shine rounded-xl px-8 shadow-lg shadow-primary/20">
              <Link href="/auth?mode=signup">
                ⚡ Instant booking
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============ CARE 19 SERVICES + STATS BAND ============ */}
      <section id="care-services" className="relative px-6 py-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              badge="Care Services"
              title="One platform, complete care"
              subtitle="From daily attendants to specialist physiotherapy and labs — pick where the care is delivered."
            />
          </Reveal>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CARE_SERVICES.map((service) => {
              const Icon = CARE_ICONS[service.label] ?? Stethoscope;
              return (
                <Link
                  key={service.label}
                  href="/auth?mode=signup"
                  className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-7 w-7" strokeWidth={1.7} />
                    </div>
                    <ArrowRight className="h-5 w-5 -translate-x-2 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold">{service.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{service.desc}</p>
                  </div>
                  <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1.5 text-[0.7rem] font-semibold text-primary">
                    🏠 At Home{service.site ? ' · 🏢 At Site' : ''}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Stats band */}
          <Reveal className="mt-14 grid grid-cols-2 gap-y-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm lg:grid-cols-4" delay={100}>
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                <s.icon className="mb-1 h-5 w-5 text-primary" strokeWidth={1.6} />
                <p className="font-heading text-3xl font-extrabold text-primary lg:text-4xl">{s.value}</p>
                <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="process" className="bg-white px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading
              badge="Simple Process"
              title="From booking to bedside in three steps"
              subtitle="No app downloads, no waiting rooms — just care at your door."
            />
          </Reveal>
          <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-16 hidden border-t-2 border-dashed border-primary/20 md:block" aria-hidden />
            {STEPS.map((step, i) => (
              <Reveal
                key={step.n}
                delay={i * 120}
                className="group relative flex h-full flex-col items-center rounded-3xl border border-slate-100 bg-slate-50/50 p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-white hover:shadow-lg"
              >
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-900 text-white shadow-lg shadow-primary/30 transition-transform duration-300 group-hover:scale-110">
                  <step.icon className="h-7 w-7" strokeWidth={1.7} />
                </div>
                <span className="absolute right-5 top-4 font-heading text-4xl font-extrabold text-primary/10">{step.n}</span>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="btn-shine rounded-xl px-8">
              <Link href="/auth?mode=signup">
                ⚡ Try it now — it takes 1 minute
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============ MENTAL HEALTH PROMO ============ */}
      <section id="mental-health" className="px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-accent">
              <Brain className="h-3.5 w-3.5" />
              Mental Health
            </span>
            <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight">
              You are not alone.
              <br />
              <span className="text-accent">Confidential support, at home.</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              Licensed therapists and mental-health professionals for anxiety, depression, grief and more — private,
              judgement-free sessions, at home or at site.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Certified counsellors & psychologists',
                'Complete privacy — sessions stay between you and your therapist',
                'Flexible slots, at home or at site',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" fill="currentColor" stroke="white" />
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-7 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/auth?mode=signup">
                Talk to someone today
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute -inset-4 -z-0 rounded-[2rem] bg-gradient-to-br from-accent/20 to-primary/10 blur-2xl" />
            <div className="relative aspect-video overflow-hidden rounded-3xl bg-slate-900 shadow-2xl ring-1 ring-slate-900/10">
              <iframe
                src="https://www.youtube.com/embed/KSKupsrgdsI"
                title="Mental health promotional video"
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section id="testimonials" className="bg-slate-950 px-6 py-24 text-white">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-5">
          {/* Rating summary */}
          <div className="flex flex-col justify-center gap-5 lg:col-span-2">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-amber-300">
              <Star className="h-3.5 w-3.5" fill="currentColor" />
              Patient Stories
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight">Loved by families across India</h2>
            <div className="flex items-end gap-5">
              <p className="font-heading text-7xl font-extrabold text-white">4.8</p>
              <div className="pb-2">
                <StarsRow />
                <p className="mt-1.5 text-xs text-slate-400">Based on 2,300+ verified reviews</p>
              </div>
            </div>
            {[
              { label: '5 ★', pct: 82 },
              { label: '4 ★', pct: 12 },
              { label: '3 ★', pct: 4 },
              { label: '2 ★', pct: 1 },
              { label: '1 ★', pct: 1 },
            ].map((bar) => (
              <div key={bar.label} className="flex items-center gap-3 text-xs text-slate-400">
                <span className="w-6">{bar.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300" style={{ width: `${bar.pct}%` }} />
                </div>
                <span className="w-8 text-right">{bar.pct}%</span>
              </div>
            ))}
          </div>

          {/* Quote cards */}
          <div className="flex flex-col justify-center gap-5 lg:col-span-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.09]"
              >
                <Quote className="h-6 w-6 text-amber-400/80" fill="currentColor" strokeWidth={0} />
                <blockquote className="mt-3 text-sm leading-relaxed text-slate-200">"{t.quote}"</blockquote>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
                  <Avatar className="h-10 w-10 ring-2 ring-white/10">
                    <AvatarImage src={t.avatar} alt={t.name} />
                    <AvatarFallback>{initials(t.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-[0.7rem] text-slate-400">{t.location}</p>
                  </div>
                  <StarsRow className="ml-auto h-3.5 w-3.5" />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section
        id="faq"
        className="px-6 py-24"
        style={{ background: 'linear-gradient(to bottom, hsl(220 72% 41% / 0.03), hsl(180 20% 99%))' }}
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-primary">
              <MessageCircleQuestion className="h-3.5 w-3.5" />
              Help Center
            </span>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight">Frequently asked questions</h2>
            <p className="mt-3 max-w-sm text-muted-foreground">Everything about verification, pricing and cancellations.</p>
            <div className="mt-8 rounded-3xl border border-primary/15 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold">Still have questions?</p>
              <p className="mt-1 text-xs text-muted-foreground">Talk to a human — we answer in minutes.</p>
              <Button asChild size="sm" className="mt-4 rounded-xl">
                <Link href="tel:+919876543210">📞 +91 98765 43210</Link>
              </Button>
            </div>
          </div>
          <div className="lg:col-span-3">
            <Accordion type="single" collapsible className="space-y-3">
              {FAQS.map((faq) => (
                <AccordionItem
                  key={faq.q}
                  value={faq.q}
                  className="overflow-hidden rounded-2xl border border-slate-100 bg-white px-6 shadow-sm"
                >
                  <AccordionTrigger className="text-left text-sm font-semibold text-slate-800 hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-slate-500">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="bg-blueprint relative overflow-hidden rounded-[2.5rem] bg-primary p-12 text-center shadow-2xl shadow-primary/30 lg:p-16">
            <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-white/90 backdrop-blur">
                <Navigation className="h-3.5 w-3.5" />
                Nurses near you are online
              </span>
              <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Need care right now?</h2>
              <p className="mx-auto mt-3 max-w-md text-lg text-white/80">
                A verified professional at your doorstep — as fast as 30 minutes.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="btn-shine rounded-xl bg-white px-8 text-base text-primary hover:bg-slate-100">
                  <Link href="/auth?mode=signup">
                    ⚡ Book instantly
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-xl border-white/25 bg-white/10 px-8 text-base text-white backdrop-blur hover:bg-white/20 hover:text-white"
                >
                  <Link href="/about">Why Sevyo?</Link>
                </Button>
              </div>
              <p className="mt-6 text-xs text-white/60">✓ No waiting rooms &nbsp;·&nbsp; ✓ Certified professionals &nbsp;·&nbsp; ✓ Pay after the visit</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
