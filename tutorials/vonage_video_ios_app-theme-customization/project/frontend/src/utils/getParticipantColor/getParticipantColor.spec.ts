import { describe, it, expect } from 'vitest';
import generateRandomColor from '.';

describe('generateRandomColor', () => {
  it('for a single character, generates a random color', () => {
    const initials = 'A';

    const randomColor = generateRandomColor(initials);

    expect(randomColor).toMatch(/^#\w{6}/);
  });

  it('for two characters, generates a random color', () => {
    const initials = 'AZ';

    const randomColor = generateRandomColor(initials);

    expect(randomColor).toMatch(/^#\w{6}/);
  });

  it('generates a color with no characters', () => {
    const initials = '';

    const randomColor = generateRandomColor(initials);

    expect(randomColor).toMatch(/^#\w{6}/);
  });

  it('can generate two different colors when initials are the same', () => {
    const cdOne = 'Charles Darwin';
    const cdTwo = 'Celine Dion';

    const randomColorOne = generateRandomColor(cdOne);
    const randomColorTwo = generateRandomColor(cdTwo);

    expect(randomColorOne).not.toBe(randomColorTwo);
  });
});
