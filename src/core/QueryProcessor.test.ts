import { QueryProcessingResultStatus, QueryProcessor } from './QueryProcessor.js';
import { Environment, EnvironmentDummy } from './Environment.js';
import { ShortcutDatabaseDummy } from './database/ShortcutDatabaseDummy.js';
import { DataDefinitionError } from '../Error.js';
import yaml from 'yaml';
import { NamespaceDispatcher } from './namespaces/NamespaceDispatcher.js';
import { RemoteSingleJsonNamespaceSourceHandler } from './namespaces/RemoteSingleJsonNamespaceSourceHandler.js';
import { InPlaceNamespaceSourceHandler } from './namespaces/InPlaceNamespaceSourceHandler.js';
import { UrlNamespaceSourceHandler } from './namespaces/UrlNamespaceSourceHandler.js';
import { GithubNamespaceSourceHandler } from './namespaces/GithubNamespaceSourceHandler.js';
import { ObjectShortcutDatabase } from './database/ObjectShortcutDatabase.js';

test('process known keyword', async () => {
  const result = await getQueryProcessor().process('bvg Hermannplatz, Alexanderplatz');

  expect(result.status).toBe(QueryProcessingResultStatus.Success);
  expect(result.url).toBe(
    'https://www.bvg.de/de/verbindungen/verbindungssuche?S=Hermannplatz&Z=Alexanderplatz&start=1',
  );
});

test('process unknown keyword', async () => {
  const result = await getQueryProcessor().process('nonexistingkeyword a, b');

  expect(result.status).toBe(QueryProcessingResultStatus.NotFound);
  expect(result.url).toBe(undefined);
});

test('process unknown keyword with configured default keyword', async () => {
  const result = await getQueryProcessor('exampledefault').process('nonexistingkeyword blah example');

  expect(result.status).toBe(QueryProcessingResultStatus.Success);
  expect(result.url).toBe('https://example.com/?query=nonexistingkeyword%20blah%20example');
});

test('process deprecated shortcut', async () => {
  const result = await getQueryProcessor().process('behvaugeh Alexanderplatz, Hermannplatz');

  expect(result.status).toBe(QueryProcessingResultStatus.Deprecated);
  expect(result.url).toBe(undefined);
  expect(result.deprecated).toEqual({
    created: '2024-03-31',
    alternativeQuery: 'bvg Alexanderplatz, Hermannplatz',
  });
});

test('process deprecated shortcut warns about non matching argument count', async () => {
  const processor = getQueryProcessor();

  expect.assertions(1);
  try {
    await processor.process('invalidalternative A, B');
  } catch (error) {
    expect(error).toBeInstanceOf(DataDefinitionError);
  }
});

test('process with deprecated shortcut without alternative is okay', async () => {
  const result = await getQueryProcessor().process('noalterantive A, B');

  expect(result.status).toBe(QueryProcessingResultStatus.Deprecated);
  expect(result.deprecated).toEqual({
    created: '2024-03-31',
    alternativeQuery: undefined,
  });
});

test('process with non-deprecated shourtcut without url throws exception', async () => {
  const processor = getQueryProcessor();

  expect.assertions(1);
  try {
    await processor.process('resultmissingurl A, B');
  } catch (error) {
    expect(error).toBeInstanceOf(DataDefinitionError);
  }
});

test.skip('trovu compatibility', async () => {
  const namespaceDispatcher = new NamespaceDispatcher([
    new RemoteSingleJsonNamespaceSourceHandler(RemoteSingleJsonNamespaceSourceHandler.QXS_DATA_SOURCE),
    new InPlaceNamespaceSourceHandler(),
    new UrlNamespaceSourceHandler(),
    new GithubNamespaceSourceHandler(),
  ]);
  const shortcutDatabase = new ObjectShortcutDatabase(namespaceDispatcher);

  const url = 'https://raw.githubusercontent.com/trovu/trovu/master/tests/calls.yml';
  const response = await fetch(url);
  const data = await response.text();
  const tests = yaml.parse(data);

  const skippedTests = [
    // TODO: replacing date or cities is currently not implemented
    'db 4',
    '.de.db 4',
    'gd 2 with city mapping',
    'gd 2 with city mapping from france',
    // trovu-webinterface-only
    'reload with query',
  ];

  const failed: string[] = [];
  for (const test of tests) {
    if (skippedTests.includes(test['title'])) {
      continue;
    }
    const env = mapEnvironment(test['env']);
    const queryProcessor = new QueryProcessor(env, shortcutDatabase);
    try {
      const result = await queryProcessor.process(test['env']['query']);
      const success = result.url === test['response']['redirectUrl'];
      if (!success) {
        failed.push(test['title'] + ' EXPECTED: ' + test['response']['redirectUrl'] + ' GOT: ' + result.url);
      }
    } catch (e) {
      failed.push(test['title'] + ' EXCEPTION: ' + (e instanceof Error ? e.message : '?'));
    }
  }

  expect(failed).toEqual([]);
}, 30000);

/* eslint-disable  @typescript-eslint/no-explicit-any */
function mapEnvironment(env: Record<string, any>): Environment {
  const namespaces = env['namespaces'] ?? ['o', env['language'] ?? 'en', '.' + (env['country'] ?? '.us')];
  return new EnvironmentDummy(env['defaultKeyword'], namespaces, env['country'] ?? 'us', env['language'] ?? 'en');
}

function getQueryProcessor(defaultKeyword: string | undefined = undefined): QueryProcessor {
  return new QueryProcessor(new EnvironmentDummy(defaultKeyword), new ShortcutDatabaseDummy());
}
