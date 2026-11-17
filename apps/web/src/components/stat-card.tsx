import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Tone = 'primary' | 'amber' | 'emerald' | 'rose' | 'blue' | 'violet';

const TONES: Record<Tone, string> = {
  primary: 'bg-primary/10 text-primary',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  rose: 'bg-rose-50 text-rose-600',
  blue: 'bg-blue-50 text-blue-600',
  violet: 'bg-violet-50 text-violet-600',
};

export function StatCard({
  label,
  value,
  icon,
  tone = 'primary',
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <Card className="flex items-start justify-between p-5 transition-shadow hover:shadow">
      <div>
        <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 font-heading text-2xl font-bold">{value}</p>
      </div>
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.625rem]', TONES[tone])}>
        {icon}
      </div>
    </Card>
  );
}