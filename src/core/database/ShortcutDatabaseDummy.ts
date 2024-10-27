import { NamespaceSource } from '../Environment.js';
import { Shortcut } from './Shortcut.js';
import { ShortcutDatabase } from './ShortcutDatabase.js';

/**
 * Dummy for usage in unit tests
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export class ShortcutDatabaseDummy implements ShortcutDatabase {
  public async search(
    _query: string,
    _language: string,
    _namespaces: NamespaceSource[],
  ): Promise<Record<string, Shortcut>> {
    return {
      'bvg 2': {
        url: 'https://www.bvg.de/de/verbindungen/verbindungssuche?S=<Start>&Z=<Ziel>&start=1',
        title: 'BVG-Fahrplanauskunft',
      },
    };
  }

  public async getShortcut(keyword: string, argumentCount: number): Promise<Shortcut | undefined> {
    if (keyword === 'bvg' && argumentCount === 2) {
      return {
        url: 'https://www.bvg.de/de/verbindungen/verbindungssuche?S=<Start>&Z=<Ziel>&start=1',
        title: 'BVG-Fahrplanauskunft',
      };
    }

    if (keyword === 'behvaugeh' && argumentCount === 2) {
      return {
        deprecated: {
          alternative: {
            query: 'bvg <1>, <2>',
          },
          created: '2024-03-31',
        },
      };
    }

    if (keyword === 'noalterantive' && argumentCount === 2) {
      return {
        deprecated: {
          created: '2024-03-31',
        },
      };
    }

    if (keyword === 'invalidalternative' && argumentCount === 2) {
      return {
        deprecated: {
          alternative: {
            query: 'alternative <1>, <2>, <3>', // invalid number of arguments in alternative
          },
          created: '2024-03-31',
        },
      };
    }

    if (keyword === 'resultmissingurl' && argumentCount === 2) {
      return {
        title: 'Result with missing URL',
      };
    }

    if (keyword === 'exampledefault' && argumentCount === 1) {
      return {
        url: 'https://example.com/?query=<query>',
        title: 'Example Default Keyword',
      };
    }

    return undefined;
  }
}
