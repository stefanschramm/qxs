import { UrlProcessor } from './UrlProcessor.js';
import { test, expect } from 'vitest';

test('process replaces argument placeholders', () => {
  const urlProcessor = new UrlProcessor('en', 'de');

  const result = urlProcessor.process(
    'https://www.bvg.de/de/verbindungen/verbindungssuche?S=<Start>&Z=<Ziel>&start=1',
    ['Alexanderplatz', 'Hermannplatz'],
  );

  expect(result).toEqual('https://www.bvg.de/de/verbindungen/verbindungssuche?S=Alexanderplatz&Z=Hermannplatz&start=1');
});

test('process joins last argument when there are more arguments than placeholders', () => {
  const urlProcessor = new UrlProcessor('en', 'de');

  const result = urlProcessor.process('https://www.google.de/search?hl=de&q=<query>&ie=utf-8', [
    'Alexanderplatz',
    'Hermannplatz',
  ]);

  expect(result).toEqual('https://www.google.de/search?hl=de&q=Alexanderplatz%2CHermannplatz&ie=utf-8');
});

test('process replaces variable placeholder', () => {
  const urlProcessor = new UrlProcessor('en', 'de');

  const result = urlProcessor.process(
    'https://<$language>.wikipedia.org/wiki/Special:Search?go=Article&search=<article>',
    ['Berlin'],
  );

  expect(result).toEqual('https://en.wikipedia.org/wiki/Special:Search?go=Article&search=Berlin');
});
