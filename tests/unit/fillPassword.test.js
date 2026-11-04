/** @jest-environment jsdom */
import { fillPasswordField } from '../../src/shared/fillPassword';

const html = (body) => {
  document.body.innerHTML = body;
};

describe('fillPasswordField', () => {
  it('fills the password field and fires input/change events', () => {
    html('<input type="text" id="t"><input type="password" id="p" placeholder="Passwort">');
    const onInput = jest.fn();
    const onChange = jest.fn();
    const field = document.getElementById('p');
    field.addEventListener('input', onInput);
    field.addEventListener('change', onChange);

    expect(fillPasswordField('geheim')).toBe('ok');
    expect(field.value).toBe('geheim');
    expect(document.getElementById('t').value).toBe('');
    expect(onInput).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('skips hidden, disabled and read-only fields', () => {
    html(
      '<input type="password" id="a" style="display:none">' +
        '<input type="password" id="b" disabled>' +
        '<input type="password" id="c" readonly>' +
        '<div hidden><input type="password" id="d"></div>' +
        '<input type="password" id="e">',
    );
    expect(fillPasswordField('x')).toBe('ok');
    expect(['a', 'b', 'c', 'd'].map((id) => document.getElementById(id).value)).toEqual([
      '',
      '',
      '',
      '',
    ]);
    expect(document.getElementById('e').value).toBe('x');
  });

  it('reports no-field without touching the page', () => {
    html('<input type="text" id="t">');
    expect(fillPasswordField('x')).toBe('no-field');
    expect(document.getElementById('t').value).toBe('');
  });

  it('is detected by a React-style value tracker', () => {
    html('<input type="password" id="p">');
    const field = document.getElementById('p');
    let tracked = '';
    const seen = [];
    field.addEventListener('input', () => {
      if (field.value !== tracked) seen.push(field.value);
    });
    fillPasswordField('abc');
    expect(seen).toEqual(['abc']);
  });
});
