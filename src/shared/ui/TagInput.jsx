import { useId, useState } from 'react';
import { MAX_TAGS, normalizeTags } from '../entries';
import Chip from './Chip';
import { Field } from './Field';

/** Chip input: Enter or comma adds, Backspace on an empty field removes the last tag. */
export default function TagInput({ label, value, onChange, suggestions = [] }) {
  const id = useId();
  const listId = `${id}-suggestions`;
  const [draft, setDraft] = useState('');

  const add = (raw) => {
    const next = normalizeTags([...value, ...raw.split(',')]);
    if (next.length !== value.length) onChange(next);
    setDraft('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (draft.trim()) add(draft);
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <Field label={<label htmlFor={id}>{label}</label>}>
      <div className="tag-input">
        {value.map((tag) => (
          <Chip
            key={tag}
            onRemove={() => onChange(value.filter((t) => t !== tag))}
            removeLabel={`Tag ${tag} entfernen`}
          >
            {tag}
          </Chip>
        ))}
        {value.length < MAX_TAGS && (
          <input
            id={id}
            className="tag-input__field"
            list={listId}
            placeholder={value.length ? '' : 'Tag + Enter'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => draft.trim() && add(draft)}
          />
        )}
        <datalist id={listId}>
          {suggestions
            .filter((s) => !value.includes(s))
            .map((s) => (
              <option key={s} value={s} />
            ))}
        </datalist>
      </div>
    </Field>
  );
}
