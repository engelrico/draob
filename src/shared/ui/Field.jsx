import { useId, useState } from 'react';
import Icon from './Icon';

/** Label on the left, control on the right (grid parent: `.form`). */
export function Field({ label, children }) {
  return (
    <>
      <span className="form__label">{label}</span>
      {children}
    </>
  );
}

export function TextInput({ label, ...rest }) {
  const id = useId();
  return (
    <Field label={<label htmlFor={id}>{label}</label>}>
      <input id={id} className="input" {...rest} />
    </Field>
  );
}

export function PasswordInput({ label, ...rest }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <Field label={<label htmlFor={id}>{label}</label>}>
      <div className="input-wrap">
        <input id={id} className="input" type={visible ? 'text' : 'password'} {...rest} />
        <button
          type="button"
          className="input-wrap__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Passwort verbergen' : 'Passwort anzeigen'}
        >
          <Icon name={visible ? 'eye-off' : 'eye'} />
        </button>
      </div>
    </Field>
  );
}

export function Notice({ kind = 'success', children }) {
  return (
    <div className={`notice notice--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
