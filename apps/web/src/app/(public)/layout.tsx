import Link from 'next/link';
import { LogoLink } from '@/components/logo';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { label: 'Services', href: '/#services' },
  { label: 'About', href: '/about' },
  { label: 'Process', href: '/#process' },
  { label: 'Testimonials', href: '/#testimonials' },
  { label: 'FAQ', href: '/#faq' },
];

const FOOTER_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Contact Us', href: '#' },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 shadow-sm backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <LogoLink imgClassName="h-12 w-auto" />
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-500 transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/auth"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-primary"
            >
              Sign In
            </Link>
            <Button asChild className="rounded-xl px-5 py-2.5">
              <Link href="/auth?mode=signup">⚡ Book Now</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-10 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-1">
            <LogoLink imgClassName="h-10 w-auto" />
            <p className="text-xs text-slate-400">© 2026 Sevyo Health. Professional Care at Home.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-slate-400 transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}