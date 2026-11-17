import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function SevyoLogo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/sevyo-logo.png"
      alt="Sevyo"
      width={600}
      height={416}
      priority={priority}
      className={cn('h-auto w-auto object-contain', className)}
    />
  );
}

export function LogoLink({
  href = '/',
  className,
  imgClassName,
}: {
  href?: string;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <Link href={href} className={className} aria-label="Sevyo home">
      <SevyoLogo className={imgClassName ?? 'h-12 w-auto'} />
    </Link>
  );
}