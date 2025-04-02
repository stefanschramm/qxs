import { getPlaceholders, PlaceholderType } from './PlaceholderExtractor';
import { test, expect } from 'vitest';

test('gets argument placeholders', () => {
  const result = getPlaceholders('https://www.bvg.de/de/verbindungen/verbindungssuche?S=<Start>&Z=<Ziel>&start=1');

  expect(result).toEqual([
    {
      pattern: '<Start>',
      name: 'Start',
      type: PlaceholderType.ARGUMENT,
    },
    {
      pattern: '<Ziel>',
      name: 'Ziel',
      type: PlaceholderType.ARGUMENT,
    },
  ]);
});

test('gets argument and variable placeholders', () => {
  const result = getPlaceholders('https://<$language>.wikipedia.org/wiki/Special:Search?go=Article&search=<article>');

  expect(result).toEqual([
    {
      pattern: '<$language>',
      name: undefined,
      type: PlaceholderType.VARIABLE,
    },
    {
      pattern: '<article>',
      name: 'article',
      type: PlaceholderType.ARGUMENT,
    },
  ]);
});
