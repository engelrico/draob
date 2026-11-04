export default function Button({
  variant = 'secondary',
  busy = false,
  block,
  icon,
  className = '',
  children,
  ...rest
}) {
  const classes = ['btn', `btn--${variant}`, block && 'btn--block', icon && 'btn--icon', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button className={classes} disabled={busy || rest.disabled} {...rest}>
      {busy && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
