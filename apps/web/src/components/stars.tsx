import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const rounded = Math.round(rating);
  const dim = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(dim, i < rounded ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200')}
        />
      ))}
    </div>
  );
}