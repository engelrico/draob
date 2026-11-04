export const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'list', label: 'Liste' },
  { id: 'config', label: 'Config' },
  { id: 'about', label: 'About' },
];

export default function Tabs({ active, onChange }) {
  return (
    <nav className="tabs" role="tablist" aria-label="Bereiche">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          role="tab"
          id={`tab-${id}`}
          aria-selected={active === id}
          aria-controls="view"
          className="tab"
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
