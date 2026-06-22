import { describe, expect, it } from 'vitest';
import generateRoomName from '.';

describe('generateRoomName', () => {
  it('returns a random adjective-animal combination', () => {
    const adjectiveAnimalCombo = generateRoomName();

    expect(typeof adjectiveAnimalCombo).toBe('string');
    expect(adjectiveAnimalCombo.split('-').length).toBeGreaterThanOrEqual(2);
  });

  it('should generate different combinations', () => {
    // Not a perfect test, but 1 in 6580 chance of them being the same.
    expect(generateRoomName()).not.toBe(generateRoomName());
  });
});
