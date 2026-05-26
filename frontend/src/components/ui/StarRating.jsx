import { Star } from 'lucide-react';

export function StarRating({ rating, max = 5, size = 16, interactive = false, onChange }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          onClick={() => interactive && onChange?.(i + 1)}
          className={`${i < Math.round(rating) ? 'fill-gold-400 text-gold-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:text-gold-400 transition-colors' : ''}`}
        />
      ))}
    </div>
  );
}

export function RatingDisplay({ avg, total }) {
  return (
    <div className="flex items-center gap-2">
      <StarRating rating={avg || 0} size={14} />
      <span className="text-sm text-gray-600">
        {avg ? `${avg.toFixed(1)} (${total} reseña${total !== 1 ? 's' : ''})` : 'Sin reseñas'}
      </span>
    </div>
  );
}
