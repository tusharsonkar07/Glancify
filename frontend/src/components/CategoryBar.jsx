const CATEGORIES = [
  { id: 'top',           label: 'Top Stories', emoji: '🔥' },
  { id: 'technology',    label: 'Technology',  emoji: '💻' },
  { id: 'business',      label: 'Business',    emoji: '📈' },
  { id: 'sports',        label: 'Sports',      emoji: '⚽' },
  { id: 'entertainment', label: 'Entertain',   emoji: '🎬' },
  { id: 'science',       label: 'Science',     emoji: '🔬' },
  { id: 'health',        label: 'Health',      emoji: '🩺' },
];

export default function CategoryBar({ active, onChange }) {
  return (
    <nav
      aria-label="News categories"
      className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2"
    >
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            aria-pressed={isActive}
            className={`
              flex items-center gap-1.5 whitespace-nowrap
              px-3.5 py-2 rounded-full text-sm font-body font-medium
              transition-all duration-150 select-none
              ${isActive
                ? 'bg-ink text-white shadow-sm'
                : 'bg-white text-slate border border-rule hover:border-slate/40 hover:text-ink'
              }
            `}
          >
            <span className="text-base leading-none">{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export { CATEGORIES };
