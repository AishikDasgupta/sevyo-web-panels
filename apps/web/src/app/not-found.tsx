import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <p className="font-heading text-7xl font-extrabold text-primary">404</p>
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold">This page doesn&apos;t exist</h1>
        <p className="text-sm text-muted-foreground">
          The link may be broken, or the page may have been moved.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">Go to homepage</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth">Sign in</Link>
        </Button>
      </div>
    </main>
  );
}
