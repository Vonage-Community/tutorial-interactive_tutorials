import { describe, expect, it } from 'vitest';
import linkGroupsParser from './linkGroupsParser';

describe('linkGroupsParser', () => {
  it('if there are no links, returns extracted text', () => {
    const linkToSplit = 'Truly, famous last words on this PR being easy.';
    const splitLink = linkGroupsParser(linkToSplit);

    const expectedResults = [[linkToSplit]];

    expect(splitLink).toEqual(expectedResults);
  });

  it('can extract a link', () => {
    const linkToSplit = 'https://developer.vonage.com/en/video/client-sdks/web/overview';
    const splitLink = linkGroupsParser(linkToSplit);

    const expectedResults = [
      [
        'https://developer.vonage.com/en/video/client-sdks/web/overview',
        'developer.vonage.com/en/video/client-sdks/web/overview',
      ],
    ];

    expect(splitLink).toEqual(expectedResults);
  });

  it('can extract a link before some text', () => {
    const linkToSplit =
      'https://developer.vonage.com/en/video/client-sdks/web/overview and some text';
    const splitLink = linkGroupsParser(linkToSplit);

    const expectedResults = [
      [
        'https://developer.vonage.com/en/video/client-sdks/web/overview',
        'developer.vonage.com/en/video/client-sdks/web/overview',
      ],
      [' and some text'],
    ];

    expect(splitLink).toEqual(expectedResults);
  });

  it('can extract a single link after text', () => {
    const linkToSplit =
      'Before link https://developer.vonage.com/en/video/client-sdks/web/overview';
    const splitLink = linkGroupsParser(linkToSplit);

    const expectedResults = [
      [
        'Before link ',
        'https://developer.vonage.com/en/video/client-sdks/web/overview',
        'developer.vonage.com/en/video/client-sdks/web/overview',
      ],
    ];

    expect(splitLink).toEqual(expectedResults);
  });

  it('can extract a single link embedded in text', () => {
    const linkToSplit =
      'Before link https://developer.vonage.com/en/video/client-sdks/web/overview and after link';
    const splitLink = linkGroupsParser(linkToSplit);

    const expectedResults = [
      // First capture group
      [
        'Before link ',
        'https://developer.vonage.com/en/video/client-sdks/web/overview',
        'developer.vonage.com/en/video/client-sdks/web/overview',
      ],
      // Second capture group
      [' and after link'],
    ];

    expect(splitLink).toEqual(expectedResults);
  });

  it('can extract two links embedded in text', () => {
    const linkToSplit =
      'First one: https://developer.vonage.com/en/video/client-sdks/web/overview and then two: www.example.com finally, did I arrive at the optimized solution, proctor?';
    const splitLink = linkGroupsParser(linkToSplit);

    const expectedResults = [
      [
        'First one: ',
        'https://developer.vonage.com/en/video/client-sdks/web/overview',
        'developer.vonage.com/en/video/client-sdks/web/overview',
      ],
      [' and then two: ', 'http://www.example.com', 'example.com'],
      // Final capture group and last shred of my sanity
      [' finally, did I arrive at the optimized solution, proctor?'],
    ];

    expect(splitLink).toEqual(expectedResults);
  });
});
