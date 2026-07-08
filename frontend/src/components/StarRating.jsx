import { HiStar } from 'react-icons/hi';

export default function StarRating({ rating = 0, max = 5, size = 'sm', onChange }) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <HiStar
          key={i}
          onClick={() => onChange && onChange(i + 1)}
          className={`${sizes[size]} transition-colors
            ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}
            ${onChange ? 'cursor-pointer hover:text-yellow-300' : ''}`}
        />
      ))}
    </div>
  );
}
