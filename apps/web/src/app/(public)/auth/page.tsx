'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api, ApiClientError } from '@/lib/api-client';
import type { ApiAuthResponse, LoginInput, RegisterInput, UserRole } from '@sevyo/shared-types';
import { LogoLink } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PORTAL_HOMES: Record<UserRole, string> = {
  user: '/user/home',
  vendor: '/vendor/dashboard',
  resource: '/resource/dashboard',
  admin: '/admin/dashboard',
};

const ROLES: { role: UserRole; label: string; icon: string }[] = [
  { role: 'user', label: 'Patient / Family', icon: '👤' },
  { role: 'vendor', label: 'Nursing Agency', icon: '🏢' },
  { role: 'resource', label: 'Nurse / Caregiver', icon: '🩺' },
  { role: 'admin', label: 'Admin', icon: '⚙️' },
];

const LEFT_FEATURES = ['Certified & verified nurses', '30-minute response time', '16+ instant medical services'];

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin',
  );
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);

  function errorMessage(err: unknown): string {
    return err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.';
  }

  function redirectToHome(userRole: UserRole) {
    router.push(PORTAL_HOMES[userRole]);
  }

  async function handleSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body: LoginInput = {
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
    };
    setLoading(true);
    try {
      const res = await api.post<ApiAuthResponse>('/auth/login', body);
      redirectToHome(res.user.role);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const phone = String(form.get('phone') ?? '').trim();
    const body: RegisterInput = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
      role,
      ...(phone ? { phone } : {}),
    };
    setLoading(true);
    try {
      const res = await api.post<ApiAuthResponse>('/auth/register', body);
      redirectToHome(res.user.role);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[75vh] items-stretch justify-center px-4 py-10">
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-card shadow-lg lg:flex-row">
        {/* LEFT PANEL */}
        <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, hsl(220 72% 41%), hsl(220 60% 30%))' }}
          />
          <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/10" />
          <div className="relative z-10 flex flex-col gap-10">
            <LogoLink imgClassName="h-14 w-auto brightness-0 invert" />
            <h2 className="text-3xl font-bold leading-snug text-white">
              Professional Medical Care
              <br />
              at Your Doorstep
            </h2>
            <ul className="flex flex-col gap-4">
              {LEFT_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-[0.95rem] text-white/85">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <p className="relative z-10 text-xs text-white/50">© 2026 Sevyo Health. Professional Care at Home.</p>
        </aside>

        {/* RIGHT PANEL */}
        <div className="flex flex-1 flex-col items-center justify-center p-8 lg:p-12">
          <Link href="/" className="mb-6 self-start text-sm text-muted-foreground transition-colors hover:text-primary">
            ← Back to home
          </Link>
          <LogoLink imgClassName="mx-auto mb-6 h-14 w-auto" />
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'signin' | 'signup')} className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" name="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input id="signin-password" name="password" type="password" placeholder="••••••••" required />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label>I am a…</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {ROLES.map((r) => (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => setRole(r.role)}
                        className={cn(
                          'rounded-xl border p-4 text-center transition-all',
                          role === r.role
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30',
                        )}
                      >
                        <div className="text-2xl">{r.icon}</div>
                        <p className="mt-1 text-xs font-semibold">{r.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input id="signup-name" name="name" type="text" placeholder="John Doe" minLength={2} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    minLength={8}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">
                    Phone <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Input id="signup-phone" name="phone" type="tel" placeholder="+91 98765 43210" maxLength={20} />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? 'Creating account…' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'signin' ? (
              <>
                New to Sevyo?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-semibold text-primary hover:underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="font-semibold text-primary hover:underline"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  );
}