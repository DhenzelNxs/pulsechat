import { displayName } from '../../src/lib/displayName';

describe('displayName', () => {
  it('joins first and last name when both are present', () => {
    expect(displayName({ firstName: 'Ada', lastName: 'Lovelace', username: 'ada' })).toBe(
      'Ada Lovelace',
    );
  });

  it('falls back to the username when no name is set', () => {
    expect(displayName({ username: 'ada' })).toBe('ada');
  });

  it('falls back to the username when only a name part is set but blank', () => {
    expect(displayName({ firstName: '', lastName: '', username: 'ada' })).toBe('ada');
  });
});
