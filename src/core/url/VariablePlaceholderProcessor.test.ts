import { DataDefinitionError } from '../../Error.js';
import { VariablePlaceholderProcessor } from './VariablePlaceholderProcessor.js';
import { test, expect } from 'vitest';

test('process replaces language', () => {
  const processor = new VariablePlaceholderProcessor('en', 'de');

  const result = processor.process('<$language>');

  expect(result).toEqual('en');
});

test('process replaces country', () => {
  const processor = new VariablePlaceholderProcessor('en', 'de');

  const result = processor.process('<$country: {}>'); // weirdo format like in Google News shortcut

  expect(result).toEqual('de');
});

test('process replaces current time', () => {
  const fakeNow = new Date('2012-01-31 22:42:13');
  const processor = new VariablePlaceholderProcessor('en', 'de', fakeNow);

  const result = processor.process('<$now: {output: HH:mm:00}>');

  expect(result).toEqual('22:42:00');
});

test('process replaces current date', () => {
  const fakeNow = new Date('2012-01-31 22:42:13');
  const processor = new VariablePlaceholderProcessor('en', 'de', fakeNow);

  const result = processor.process('<$now: {output: YYYY-MM-DD}>');

  expect(result).toEqual('2012-01-31');
});

test('process throws exception on unknown variable placeholder', () => {
  const processor = new VariablePlaceholderProcessor('en', 'de');

  expect(() => {
    processor.process('<$unknown>');
  }).toThrow(DataDefinitionError);
});
