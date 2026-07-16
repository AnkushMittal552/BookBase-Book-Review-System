export default function CategoryFilter({ categories = ['All'], active, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
            ${active === cat
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
