import { collectTags } from '../shared/entries';
import Button from '../shared/ui/Button';
import { Notice, PasswordInput, TextInput } from '../shared/ui/Field';
import Icon from '../shared/ui/Icon';
import TagInput from '../shared/ui/TagInput';

const BOARD_HINTS = {
  new: 'Neues Miro-Board erkannt. Passwort eintragen und speichern.',
  known: 'Dieses Board ist bereits gespeichert.',
};

export default function HomeView({
  form,
  setForm,
  entries,
  onSave,
  onLock,
  onFill,
  onUseExisting,
  notice,
  boardState,
  duplicate,
}) {
  const bind = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  });
  const submit = (e) => {
    e.preventDefault();
    onSave();
  };
  const suggestions = collectTags(entries).map((t) => t.tag);

  return (
    <form className="view" onSubmit={submit}>
      {boardState && <Notice kind="info">{BOARD_HINTS[boardState]}</Notice>}
      <div className="card form">
        <TextInput label="Titel" placeholder="z. B. Sprint-Board" {...bind('title')} />
        <TextInput label="URL" placeholder="https://miro.com/app/board/…" {...bind('url')} />
        <PasswordInput label="Passwort" placeholder="Board-Passwort" {...bind('password')} />
        <TagInput
          label="Tags"
          value={form.tags}
          onChange={(tags) => setForm({ ...form, tags })}
          suggestions={suggestions}
        />
        <div className="form__actions">
          <Button variant="primary" type="submit">
            {form.id ? 'Aktualisieren' : 'Speichern'}
          </Button>
          <Button
            type="button"
            icon
            className={`star${form.favorite ? ' star--on' : ''}`}
            aria-pressed={form.favorite}
            aria-label={form.favorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten'}
            onClick={() => setForm({ ...form, favorite: !form.favorite })}
          >
            <Icon name="star" filled={form.favorite} />
          </Button>
          <Button type="button" onClick={onLock}>
            Sperren
          </Button>
        </div>
      </div>
      {boardState === 'known' && (
        <Button type="button" block onClick={onFill} disabled={!form.password}>
          In Miro einfügen
        </Button>
      )}
      {duplicate && (
        <Notice kind="error">
          Für dieses Board gibt es schon einen Eintrag.
          <Button type="button" block onClick={onUseExisting} style={{ marginTop: 8 }}>
            Bestehenden Eintrag aktualisieren
          </Button>
        </Notice>
      )}
      {notice && <Notice kind={notice.kind}>{notice.text}</Notice>}
    </form>
  );
}
