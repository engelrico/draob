const version = () => globalThis.chrome?.runtime?.getManifest?.().version ?? '';

export default function Header() {
  return (
    <header className="header">
      <img className="header__logo" src="icons/icon_48.png" alt="" />
      <h1 className="header__title">draob</h1>
      <span className="header__version">v{version()}</span>
    </header>
  );
}
