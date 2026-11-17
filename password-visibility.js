/* Change only the existing field's presentation. No network, logging,
   password copies, storage or form submission. */
export function setPasswordVisible(input, visible) {
  if (!input || !['password', 'text'].includes(input.type)) return false;
  const value = input.value;
  const start = input.selectionStart, end = input.selectionEnd;
  input.setAttribute('type', visible ? 'text' : 'password');
  if (visible) {
    input.style.setProperty('-webkit-text-security', 'none', 'important');
    input.style.setProperty('input-security', 'none', 'important');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('autocorrect', 'off');
    input.spellcheck = false;
  } else {
    input.style.removeProperty('-webkit-text-security');
    input.style.removeProperty('input-security');
  }
  // Invalidate a stale secure-text paint without changing the password.
  input.value = value;
  if (start !== null && end !== null) {
    try { input.setSelectionRange(start, end); } catch (_) {}
  }
  input.dataset.passwordVisible = visible ? 'true' : 'false';
  return input.type === 'text';
}
export function togglePasswordVisibility(input) {
  return setPasswordVisible(input, input?.type === 'password');
}
