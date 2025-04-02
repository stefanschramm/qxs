import { CliConfig } from './CliConfig.js';
import { CliEnvironment } from './CliEnvironment.js';
import { test, expect } from 'vitest';

const testCliConfig: CliConfig = {
  namespaces: ['o', 'aa', '.bb'],
  country: 'aa',
  language: 'bb',
  browser: 'dontcare',
  shortcutsDir: 'dontcare',
  singleDataSourceUrl: 'https://qxs.kesto.de/data.json',
  individualShortcutsBaseUrl: 'https://raw.githubusercontent.com/trovu/trovu/master/data/shortcuts/',
  defaultKeyword: 'g',
};

test('getNamespaces', () => {
  const cliEnvironment = new CliEnvironment(testCliConfig);

  expect(cliEnvironment.getNamespaces()).toEqual(['o', 'aa', '.bb']);
});

test('getCountry', () => {
  const cliEnvironment = new CliEnvironment(testCliConfig);

  expect(cliEnvironment.getCountry()).toEqual('aa');
});

test('getLanguage', () => {
  const cliEnvironment = new CliEnvironment(testCliConfig);

  expect(cliEnvironment.getLanguage()).toEqual('bb');
});

test('getDefaultKeyword', () => {
  const cliEnvironment = new CliEnvironment(testCliConfig);

  expect(cliEnvironment.getDefaultKeyword()).toEqual('g');
});
