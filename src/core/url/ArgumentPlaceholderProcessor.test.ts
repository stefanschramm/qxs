import { ArgumentPlaceholderProcessor } from './ArgumentPlaceholderProcessor.js';

test('process replaces simple argument', () => {
  const processor = new ArgumentPlaceholderProcessor();

  const result = processor.process('<query>', 'exampleargument');

  expect(result).toEqual('exampleargument');
});

// TODO: implement functionality
test.skip('process transforms encoding', () => {
  const processor = new ArgumentPlaceholderProcessor();

  const result = processor.process('<foobar: {encoding: iso-8859-1}>	', 'Sch\u00fcssel');

  expect(result).toStrictEqual('Sch%FCssel');
});

// TODO: implement functionality
test.skip('process replaces date type', () => {
  const processor = new ArgumentPlaceholderProcessor();

  const result = processor.process('<Datum: {type: date, output: Y-m-d}>', '29.12.2023');

  expect(result).toEqual('2023-12-29');
});

// TODO: implement functionality
test.skip('process replaces time type', () => {
  const processor = new ArgumentPlaceholderProcessor();

  const result = processor.process('<Zeit: {type: time, output: HH:mm}>', '11');

  expect(result).toEqual('11:00');
});

// TODO: implement functionality
test.skip('process replaces city type', () => {
  const processor = new ArgumentPlaceholderProcessor();

  const result = processor.process('<Start: {type: city}>', 'hh');

  expect(result).toEqual('Hamburg');
});

// TODO: implement functionality
test.skip('process transforms to uppercase', () => {
  const processor = new ArgumentPlaceholderProcessor();

  const result = processor.process('<IATA-Code: {transform: uppercase}>', 'skp');

  expect(result).toEqual('SKP');
});

// TODO: implement functionality
test.skip('process transforms to lowercase', () => {
  const processor = new ArgumentPlaceholderProcessor();

  const result = processor.process('<IATA-Code: {transform: uppercase}>', 'SKP');

  expect(result).toEqual('skp');
});

// TODO: implement functionality
test.skip('process replaces transcribed esperanto characters', () => {
  const processor = new ArgumentPlaceholderProcessor();

  const result = processor.process('<foo: {transform: eo-cx}>', 'ehxosxangxo cxiujxauxde');

  expect(result).toEqual('eĥoŝanĝo ĉiuĵaŭde');
});
