const CATEGORIES = ['All', 'Sci-Fi', 'Fantasy', 'Drama', 'Business', 'Education',
                    'Geography', 'Fiction', 'Non-Fiction', 'Self-Help', 'Biography',
                    'Mystery', 'Romance', 'Horror', 'History', 'Science', 'Technology'];

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat === 'All' ? '' : cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
            ${(active === cat || (!active && cat === 'All'))
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-gray-500 hover:text-primary hover:border-primary border border-gray-200'
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
