/**
 * Fills the visible password field of the current page.
 * Runs in the page via chrome.scripting.executeScript, so it must be fully self-contained
 * (no imports, no outer variables). Never submits anything.
 * @returns {'ok' | 'no-field'}
 */
export function fillPasswordField(password) {
  const visible = (el) =>
    typeof el.checkVisibility === 'function'
      ? el.checkVisibility()
      : getComputedStyle(el).display !== 'none' && !el.closest('[hidden]');

  const field = [...document.querySelectorAll('input[type="password"]')].find(
    (el) => !el.disabled && !el.readOnly && visible(el),
  );
  if (!field) return 'no-field';

  // Use the native setter so React-style controlled inputs notice the change.
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(field, password);
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
  field.focus();
  return 'ok';
}
