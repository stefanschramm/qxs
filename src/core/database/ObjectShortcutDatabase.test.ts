import { DataDefinitionError, ImplementationError } from '../../Error.js';
import { NamespaceSource, ShortcutSearchKeyMap } from '../Environment.js';
import { NamespaceDispatcher, NamespaceSourceHandler } from '../namespaces/NamespaceDispatcher.js';
import { ObjectShortcutDatabase } from './ObjectShortcutDatabase.js';

const firstDummyShortcut = {
  title: 'First dummy shortcut',
  url: 'http://example.com/1',
};

const secondDummyShortcut = {
  title: 'Second dummy shortcut',
  url: 'http://example.com/2',
};

test('getShortcut considers argument count', async () => {
  const dispatcher = createNamespaceDispatcher({
    first: {
      'a 1': firstDummyShortcut,
      'a 2': secondDummyShortcut,
    },
  });
  const database = new ObjectShortcutDatabase(dispatcher);

  const shortcut = await database.getShortcut('a', 2, 'de', ['first']);

  expect(shortcut).toEqual(secondDummyShortcut);
});

test('getShortcut considers namespace priority', async () => {
  const dispatcher = createNamespaceDispatcher({
    first: { 'a 1': firstDummyShortcut },
    second: { 'a 1': secondDummyShortcut },
  });
  const database = new ObjectShortcutDatabase(dispatcher);

  const shortcut = await database.getShortcut('a', 1, 'de', ['second', 'first']);

  expect(shortcut).toEqual(secondDummyShortcut);
});

test('getShortcut processes include attribute', async () => {
  const dispatcher = createNamespaceDispatcher({
    first: {
      'a 1': {
        title: 'Shortcut including other shortcut',
        include: {
          key: 'b 1',
        },
      },
      'b 1': firstDummyShortcut,
    },
  });
  const database = new ObjectShortcutDatabase(dispatcher);

  const shortcut = await database.getShortcut('a', 1, 'de', ['first']);

  expect(shortcut).toEqual({
    // title of "a 1" but url of "b 1"
    title: 'Shortcut including other shortcut',
    url: 'http://example.com/1',
  });
});

test('getShortcut processes include list attribute', async () => {
  const dispatcher = createNamespaceDispatcher({
    first: {
      'a 1': {
        title: 'Shortcut including other shortcut',
        include: [
          {
            namespace: 'second',
            key: 'b 1',
          },
          {
            namespace: 'third',
            key: 'b 1',
          },
        ],
      },
    },
    second: {
      'b 1': firstDummyShortcut,
    },
    third: {
      'b 1': secondDummyShortcut,
    },
  });
  const database = new ObjectShortcutDatabase(dispatcher);

  const shortcut = await database.getShortcut('a', 1, 'de', ['first']);

  expect(shortcut).toEqual({
    // title of "a 1" but url of "b 1" of second (not third!) namespace
    title: 'Shortcut including other shortcut',
    url: 'http://example.com/1',
  });
});

test('getShortcut processes include list attribute and returns undefined if include was not found', async () => {
  const dispatcher = createNamespaceDispatcher({
    first: {
      'a 1': {
        title: 'Shortcut including other shortcut',
        include: [
          {
            namespace: 'second',
            key: 'c 1',
          },
        ],
      },
    },
    second: {},
  });
  const database = new ObjectShortcutDatabase(dispatcher);

  const shortcut = await database.getShortcut('a', 1, 'de', ['first']);

  expect(shortcut).toBeUndefined();
});

test('getShortcut returns undefined when shortcut is not found', async () => {
  const dispatcher = createNamespaceDispatcher({
    first: { 'a 1': firstDummyShortcut },
  });
  const database = new ObjectShortcutDatabase(dispatcher);

  const shortcut = await database.getShortcut('unknownkeyword', 1, 'de', ['first']);

  expect(shortcut).toEqual(undefined);
});

test('getShortcut throws exception on circular includes', async () => {
  const dispatcher = createNamespaceDispatcher({
    first: {
      'a 1': {
        title: 'Shortcut including other shortcut',
        include: {
          key: 'b 1',
        },
      },
      'b 1': {
        title: 'Shortcut including other shortcut',
        include: {
          key: 'a 1',
        },
      },
    },
  });
  const database = new ObjectShortcutDatabase(dispatcher);

  expect.assertions(1);
  try {
    await database.getShortcut('a', 1, 'de', ['first']);
  } catch (error) {
    expect(error).toBeInstanceOf(DataDefinitionError);
  }
});

function createNamespaceDispatcher(data: Record<string, ShortcutSearchKeyMap>) {
  const namespaceSourceHandler = new NamespaceSourceHandlerDummy(data);

  return new NamespaceDispatcher([namespaceSourceHandler]);
}

class NamespaceSourceHandlerDummy implements NamespaceSourceHandler {
  public constructor(private readonly data: Record<string, ShortcutSearchKeyMap>) {}

  public supports(source: NamespaceSource): boolean {
    return typeof source === 'string';
  }

  public async get(source: NamespaceSource): Promise<ShortcutSearchKeyMap> {
    if (typeof source !== 'string') {
      throw new ImplementationError('source is expected to be a string.');
    }

    return this.data[source];
  }
}
