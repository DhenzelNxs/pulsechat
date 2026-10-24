import { displayName, initials } from '../../src/lib/displayName';

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

describe('initials', () => {
  it('uses the first letter of each name part, uppercased', () => {
    expect(initials({ firstName: 'Ada', lastName: 'Lovelace', username: 'ada' })).toBe('AL');
  });

  it('uses just the first name initial when there is no last name', () => {
    expect(initials({ firstName: 'Ada', username: 'ada' })).toBe('A');
  });

  it('falls back to the first two letters of the username when no name is set', () => {
    expect(initials({ username: 'ada' })).toBe('AD');
  });
});
