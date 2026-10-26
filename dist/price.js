// Money is parsed as integer cents; an empty field is different from an explicit 0.
export function parsePrice(value) {
  const text = value.trim().replace(',', '.');
  if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  const cents = Number(whole || '0') * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) ? cents : null;
}

export function initialState(suggested, selected = null) {
  const unlocked = Number.isSafeInteger(selected) && selected >= 0;
  return { suggested, draft: '', amount: unlocked ? selected : null, unlocked, active: false };
}

export function editPrice(state, draft) {
  if (state.unlocked) return state;
  return { ...state, draft, amount: parsePrice(draft) };
}

export function activate(state) {
  if (state.unlocked) return { state: { ...state, active: !state.active }, action: state.active ? 'pause' : 'open' };
  if (state.draft.trim() === '') {
    return { state: { ...state, draft: String(state.suggested / 100), amount: state.suggested }, action: 'select' };
  }
  if (state.amount === null) return { state, action: 'invalid' };
  return { state: { ...state, unlocked: true, active: true }, action: 'open' };
}

export function tone(state) {
  if (state.unlocked || state.amount === null || state.amount === state.suggested) return 'equal';
  return state.amount > state.suggested ? 'higher' : 'lower';
}

export function symbol(state) {
  if (state.unlocked) return state.active ? '●' : '○';
  return state.amount === null ? '○' : '⊙';
}
