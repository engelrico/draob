// Small inline SVG icons (stroke = currentColor). Inline SVG is CSP-safe.
const PATHS = {
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z',
  'eye-off':
    'M3 3l18 18M10.6 6.1A9.8 9.8 0 0112 6c6.5 0 10 6 10 6a17 17 0 01-3.2 3.9M6.6 7.6A17 17 0 002 12s3.5 6 10 6c1.5 0 2.8-.3 4-.8M9.9 9.9a3 3 0 004.2 4.2',
  lock: 'M6 10V8a6 6 0 1112 0v2M5 10h14v10H5z',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  download: 'M12 3v12m0 0l-4-4m4 4l4-4M4 20h16',
  upload: 'M12 15V3m0 0L8 7m4-4l4 4M4 20h16',
};

export default function Icon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
