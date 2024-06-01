import { QueryParser } from './QueryParser.js';

test('parse trims excess spaces in arguments', () => {
  const query = 'bvg Berlin, Alexanderplatz';
  const parser = new QueryParser();

  const result = parser.parse(query);

  expect(result).toEqual({
    additionalNamespaces: [],
    keyword: 'bvg',
    args: ['Berlin', 'Alexanderplatz'],
  });
});

test('parse extracts country', () => {
  const query = '.gb.gn Art';
  const parser = new QueryParser();

  const result = parser.parse(query);

  expect(result).toEqual({
    additionalNamespaces: [],
    keyword: 'gn',
    args: ['Art'],
    language: undefined,
    country: 'gb',
  });
});

test('parse extracts language', () => {
  const query = 'en.w Hamburg';
  const parser = new QueryParser();

  const result = parser.parse(query);

  expect(result).toEqual({
    additionalNamespaces: [],
    keyword: 'w',
    args: ['Hamburg'],
    language: 'en',
  });
});

test('parse extracts country and language', () => {
  const query = '.gb.de.gn Art';
  const parser = new QueryParser();

  const result = parser.parse(query);

  expect(result).toEqual({
    additionalNamespaces: [],
    keyword: 'gn',
    args: ['Art'],
    language: 'de',
    country: 'gb',
  });
});

test('parse extracts additional namespaces', () => {
  const query = 'en.blah.w Hamburg';
  const parser = new QueryParser();

  const result = parser.parse(query);

  expect(result).toEqual({
    additionalNamespaces: ['blah'],
    keyword: 'w',
    args: ['Hamburg'],
    language: 'en',
  });
});

test('parse recognizes 0-argument queries', () => {
  const query = 'w';
  const parser = new QueryParser();

  const result = parser.parse(query);

  expect(result).toEqual({
    additionalNamespaces: [],
    keyword: 'w',
    args: [],
  });
});
