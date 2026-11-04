export default function AboutView() {
  return (
    <div className="view">
      <div className="card">
        <h2 className="card__title" style={{ textAlign: 'left' }}>
          Über MiroHero
        </h2>
        <p className="muted" style={{ textAlign: 'left', marginTop: 6 }}>
          Speichert Passwörter für Miro-Boards lokal und verschlüsselt (AES-GCM, Schlüssel aus
          deinem Masterpasswort). Es verlässt nichts diesen Browser.
        </p>
      </div>
    </div>
  );
}
