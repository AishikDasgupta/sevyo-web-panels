import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { initials } from '@/lib/format';
import type { Service } from '@sevyo/shared-types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Stars } from '@/components/stars';
import { CARE_SERVICES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Professional Care at Home',
  description:
    'Book trusted nurses, attendants, and home healthcare professionals for your loved ones — within minutes, no waiting rooms.',
};

export const dynamic = 'force-dynamic';

const INSTANT_ICONS: Record<string, string> = {
  'IV Cannulation': '💉',
  'IM / SC Injection': '💉',
  'IV Injection': '💉',
  'Multi-Vitamin IV': '💊',
  'Electrolyte IV (NS/RL/DNS)': '💧',
  'Major Dressing': '🩹',
  'Minor Wound Dressing': '🩹',
  'Diabetic Foot Ulcer Dressing': '🩺',
  "Foley's Catheter Remove": '🌬️',
  "Foley's Catheter Insert": '🌬️',
  "Ryle's Tube": '🧪',
  'Enema Service': '🩺',
  'Bedsore Dressing': '🩹',
  'Albumin Injection': '💉',
  'Suture Removal / Care': '❤️',
  'Antibiotic IV': '💉',
};

const FALLBACK_INSTANT_SERVICES = [
  'IV Cannulation',
  'IM / SC Injection',
  'IV Injection',
  'Multi-Vitamin IV',
  'Electrolyte IV (NS/RL/DNS)',
  'Major Dressing',
  'Minor Wound Dressing',
  'Diabetic Foot Ulcer Dressing',
  "Foley's Catheter Remove",
  "Foley's Catheter Insert",
  "Ryle's Tube",
  'Enema Service',
  'Bedsore Dressing',
  'Albumin Injection',
  'Suture Removal / Care',
  'Antibiotic IV',
];

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

const STEPS = [
  {
    n: '01',
    title: 'Choose Your Service',
    desc: 'Pick from our range of specialised at-home medical procedures, from IV drips to dressings and more.',
  },
  {
    n: '02',
    title: 'We Match a Nurse',
    desc: 'Our team finds a verified, trained nurse near you within minutes — no apps, no hassle.',
  },
  {
    n: '03',
    title: 'Care at Your Doorstep',
    desc: 'Receive professional medical care safely from home. No waiting rooms, no commutes.',
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

function SectionHeading({
  badge,
  badgeClass,
  title,
  subtitle,
}: {
  badge: string;
  badgeClass: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8 text-center">
      <span className={`inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[.1em] ${badgeClass}`}>
        {badge}
      </span>
      <h2 className="mt-3 text-3xl sm:text-4xl">{title}</h2>
      {subtitle ? (
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  );
}

export default async function HomePage() {
  const instantServices = await getInstantServiceNames();

  return (
    <div>
      {/* HERO */}
      <section
        className="relative overflow-hidden px-6 py-28 lg:py-40"
        style={{ background: 'linear-gradient(to bottom, hsl(220 72% 41% / .06), hsl(180 20% 99%))' }}
      >
        <div
          className="pointer-events-none absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full blur-[100px]"
          style={{ background: 'hsl(220 72% 41% / .05)' }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full blur-[100px]"
          style={{ background: 'hsl(351 60% 45% / .05)' }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="animate-fade-up">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[.1em] text-primary">
              Professional Care at Home
            </span>
            <h1 className="mt-6 text-5xl leading-[1.08] sm:text-6xl">
              Medical Care
              <br />
              <span className="text-primary">at Your Doorstep</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Book trusted nurses, attendants, and home healthcare professionals for your loved ones — within
              minutes, no waiting rooms.
            </p>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '.15s' }}>
            <Button asChild size="lg">
              <Link href="/auth?mode=signup">⚡ Instant Booking</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white">
              <Link href="/auth">Get Started</Link>
            </Button>
          </div>
          <div
            className="mt-4 flex flex-wrap items-center justify-center gap-8 animate-fade-up"
            style={{ animationDelay: '.3s' }}
          >
            <span className="flex items-center gap-2 text-sm text-muted-foreground">🛡️ Verified nurses only</span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">⏱️ 30-min response</span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">⭐ 4.8 avg rating</span>
          </div>
          <div className="animate-fade-up" style={{ animationDelay: '.45s' }}>
            <p className="mx-auto mt-4 max-w-xl rounded-2xl border border-slate-100 bg-white/70 p-4 text-sm font-medium italic text-slate-500 shadow-sm">
              "Seamless connection with hundreds of verified healthcare providers, nursing agencies, labs, and care
              centers — through Sevyo"
            </p>
          </div>
        </div>
      </section>

      {/* INSTANT SERVICES */}
      <section id="services" className="bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            badge="Available Now"
            badgeClass="bg-accent/10 text-accent"
            title="Services You Can Book Instantly"
            subtitle="All services performed at your home by trained, certified nursing professionals."
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {instantServices.map((name) => (
              <Link
                key={name}
                href="/auth?mode=signup"
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-white hover:shadow"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xl">
                  {INSTANT_ICONS[name] ?? '💉'}
                </span>
                <span className="text-xs font-semibold leading-tight text-slate-700">{name}</span>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link href="/auth?mode=signup">⚡ Book a Service Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CARE SERVICES */}
      <section
        id="care-services"
        className="px-6 py-24"
        style={{ background: 'linear-gradient(to bottom, hsl(220 72% 41% / .04), hsl(180 20% 99%))' }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            badge="Care Services"
            badgeClass="bg-primary/10 text-primary"
            title="Professional Care, Your Way"
            subtitle="From daily attendants to physiotherapy and labs — choose where you want the care delivered."
          />
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

      {/* MENTAL HEALTH PROMO */}
      <section id="mental-health" className="bg-white px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            badge="Mental Health"
            badgeClass="bg-accent/10 text-accent"
            title="You Are Not Alone"
            subtitle="Professional, judgement-free emotional and psychological support — at home or at site."
          />
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900 shadow-lg">
            <iframe
              src="https://www.youtube.com/embed/KSKupsrgdsI"
              title="Mental health promotional video"
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="process"
        className="px-6 py-24"
        style={{ background: 'linear-gradient(to bottom, hsl(220 72% 41% / .04), hsl(180 20% 99%))' }}
      >
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            badge="Simple Process"
            badgeClass="bg-primary/10 text-primary"
            title="How It Works"
            subtitle="From booking to bedside care in three effortless steps."
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="flex h-full flex-col gap-5 rounded-3xl border border-slate-100 bg-white p-8 shadow-sm"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 font-heading text-xl font-bold text-primary">
                  {step.n}
                </div>
                <div>
                  <h4 className="mb-2 text-lg">{step.title}</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild size="lg">
              <Link href="/auth?mode=signup">⚡ Try It Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="bg-white px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading badge="Patient Stories" badgeClass="bg-accent/10 text-accent" title="What Our Patients Say" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="flex h-full flex-col rounded-3xl border border-slate-100 bg-slate-50/80 p-7"
              >
                <Stars rating={5} size="md" />
                <p className="mt-4 flex-1 text-sm italic leading-relaxed text-slate-500">"{t.quote}"</p>
                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={t.avatar} alt={t.name} />
                    <AvatarFallback>{initials(t.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h5 className="text-sm font-semibold">{t.name}</h5>
                    <p className="text-xs text-slate-400">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="px-6 py-24"
        style={{ background: 'linear-gradient(to bottom, hsl(220 72% 41% / .03), hsl(180 20% 99%))' }}
      >
        <div className="mx-auto max-w-3xl">
          <SectionHeading badge="Help Center" badgeClass="bg-primary/10 text-primary" title="Frequently Asked Questions" />
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((faq) => (
              <AccordionItem
                key={faq.q}
                value={faq.q}
                className="rounded-xl border border-slate-100 bg-white px-5 shadow-sm"
              >
                <AccordionTrigger className="text-left text-sm font-semibold text-slate-800">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-slate-500">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div
            className="relative overflow-hidden rounded-3xl p-14 text-center shadow-lg lg:p-20"
            style={{ background: 'linear-gradient(135deg, hsl(220 72% 47%), hsl(220 72% 41%))' }}
          >
            <h2 className="text-4xl text-white lg:text-5xl">Need a Nurse Now?</h2>
            <p className="mt-3 text-lg text-white/80">Professional care arrives at your door in minutes.</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-slate-100">
                <Link href="/auth?mode=signup">⚡ Instant Booking</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="border border-white/30 bg-white/15 text-white hover:bg-white/25"
              >
                <Link href="/auth?mode=signup">Create Account</Link>
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
              <span>✓ No waiting rooms</span>
              <span>✓ Certified professionals</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}