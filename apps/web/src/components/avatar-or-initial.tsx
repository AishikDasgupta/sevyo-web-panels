import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { assetUrl, initials } from '@/lib/format';
import { cn } from '@/lib/utils';

export function AvatarOrInitial({
  name,
  avatarUrl,
  className,
}: {
  name?: string | null;
  avatarUrl?: string | null;
  className?: string;
}) {
  const src = assetUrl(avatarUrl);
  return (
    <Avatar className={cn('h-10 w-10', className)}>
      {src && <AvatarImage src={src} alt={name ?? ''} />}
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}