import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePrice, initialState, editPrice, activate, tone, symbol } from '../dist/price.js';

test('an untouched price takes two presses: select, then open', () => {
  const initial = initialState(1000);
  assert.equal(symbol(initial), '○');
  const first = activate(initial);
  assert.equal(first.action, 'select');
  assert.equal(first.state.draft, '10');
  assert.equal(first.state.unlocked, false);
  assert.equal(symbol(first.state), '⊙');
  const second = activate(first.state);
  assert.equal(second.action, 'open');
  assert.equal(second.state.amount, 1000);
  assert.equal(second.state.unlocked, true);
  assert.equal(symbol(second.state), '●');
});

test('an entered amount takes one press, including zero', () => {
  for (const [draft, cents, color] of [['0', 0, 'lower'], ['5', 500, 'lower'], ['10', 1000, 'equal'], ['15', 1500, 'higher'], ['10,01', 1001, 'higher']]) {
    const state = editPrice(initialState(1000), draft);
    assert.equal(symbol(state), '⊙');
    assert.equal(tone(state), color);
    const result = activate(state);
    assert.equal(result.action, 'open');
    assert.equal(result.state.amount, cents);
    assert.equal(result.state.unlocked, true);
    assert.equal(tone(result.state), 'equal');
  }
});

test('after price disappears, the circle toggles in one press without a dotted state', () => {
  const playing = activate(editPrice(initialState(1000), '15')).state;
  const paused = activate(playing);
  assert.equal(paused.action, 'pause');
  assert.equal(symbol(paused.state), '○');
  assert.equal(paused.state.unlocked, true);
  assert.equal(tone(paused.state), 'equal');
  const resumed = activate(paused.state);
  assert.equal(resumed.action, 'open');
  assert.equal(symbol(resumed.state), '●');
});

test('reloading a selected amount retains direct, one-press access', () => {
  const restored = initialState(1000, 0);
  assert.equal(restored.unlocked, true);
  assert.equal(symbol(restored), '○');
  assert.equal(activate(restored).action, 'open');
});

test('decimal money remains exact, and invalid amounts never unlock', () => {
  assert.equal(parsePrice('0.29'), 29);
  assert.equal(parsePrice(',50'), 50);
  assert.equal(parsePrice('10.'), 1000);
  for (const text of ['-1', '1e3', 'NaN', 'Infinity', '1.001', '1,2.3', 'abc', '9007199254740991']) {
    const result = activate(editPrice(initialState(1000), text));
    assert.equal(result.action, 'invalid');
    assert.equal(result.state.unlocked, false);
  }
  assert.equal(parsePrice(''), null);
  assert.equal(activate(editPrice(initialState(1000), '')).action, 'select');
});
