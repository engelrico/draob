import Icon from './Icon';

/** Small pill. With `onClick` it is a toggle (aria-pressed); with `onRemove` it shows a remove button. */
export default function Chip({ children, active = false, onClick, onRemove, removeLabel }) {
  const classes = `chip${active ? ' chip--active' : ''}${onClick ? ' chip--button' : ''}`;
  if (onClick) {
    return (
      <button type="button" className={classes} aria-pressed={active} onClick={onClick}>
        {children}
      </button>
    );
  }
  return (
    <span className={classes}>
      {children}
      {onRemove && (
        <button type="button" className="chip__x" onClick={onRemove} aria-label={removeLabel}>
          <Icon name="x" size={12} />
        </button>
      )}
    </span>
  );
}
