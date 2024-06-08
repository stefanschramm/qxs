import { DataDefinitionError } from '../../Error.js';
import { NamespaceSource } from '../Environment.js';
import { Logger } from '../Logger.js';
import { NamespaceDispatcher } from '../namespaces/NamespaceDispatcher.js';
import { IncludeDefinition, Shortcut } from './Shortcut.js';
import { ShortcutDatabase } from './ShortcutDatabase.js';

/**
 * Shortcut database that is based on a hierarchy of JavaScript objects grouped by namespaces (classical Trovu YAML data)
 */
export class ObjectShortcutDatabase implements ShortcutDatabase {
  constructor(private readonly namespaceDispatcher: NamespaceDispatcher) {}

  public async getShortcut(
    keyword: string,
    argumentCount: number,
    language: string,
    namespaces: NamespaceSource[],
  ): Promise<Shortcut | undefined> {
    const finder = new ShortcutFinder(namespaces, this.namespaceDispatcher, language);

    // If no shourtcut with matching argument count is found, search for next with less arguments.
    // On URL processing, the excess arguments will be joined into the last one.
    let result = undefined;
    while (argumentCount > 0 && result === undefined) {
      const searchKey = `${keyword} ${argumentCount}`;
      result = await finder.getShortcutBySearchKey(searchKey);
      argumentCount--;
    }

    return result;
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  public async search(
    query: string,
    language: string,
    namespaces: NamespaceSource[],
  ): Promise<Record<string, Shortcut>> {
    const finder = new ShortcutFinder(namespaces, this.namespaceDispatcher, language);
    const normalizedQuery = query.toLowerCase();

    return finder.getShortcutsByFulltextSearch(normalizedQuery);
  }
}

function shortcutMatches(shortcut: Shortcut, normalizedQuery: string): boolean {
  return (
    (shortcut.title?.toLowerCase().includes(normalizedQuery) ?? false) ||
    (shortcut.description?.toLowerCase().includes(normalizedQuery) ?? false) ||
    (shortcut.url?.toLowerCase().includes(normalizedQuery) ?? false)
  );
}

class ShortcutFinder {
  public constructor(
    private readonly namespaces: NamespaceSource[],
    private readonly namespaceDispatcher: NamespaceDispatcher,
    /** Language to use when replacing search keys of includes */
    private readonly language: string,
  ) {}

  public async getShortcutBySearchKey(
    searchKey: string,
    overrideNamespaces: NamespaceSource[] | undefined = undefined,
    maxDepth = 10,
  ): Promise<Shortcut | undefined> {
    if (maxDepth <= 0) {
      throw new DataDefinitionError(`Possible circular inclusion detected for searchKey "${searchKey}".`);
    }

    const namespacesToSearchIn = overrideNamespaces === undefined ? this.namespaces : overrideNamespaces;

    Logger.debug(`ShortcutFinder: Searching for "${searchKey}" in ${namespacesToSearchIn.length} namespace(s)`);

    // Iterate in reverse order because namespacesToSearchIn has the lowest priority first.
    for (const namespace of namespacesToSearchIn.slice().reverse()) {
      // Non-existent namespace will cause a fallback to the next lower priority namespace.
      const namespaceData = (await this.namespaceDispatcher.get(namespace)) ?? [];
      let shortcut = namespaceData[searchKey];
      if (shortcut === undefined) {
        continue; // look in next namespace
      }

      if (typeof shortcut === 'string') {
        // short string-only notation (not used in official namespaces)
        return {
          url: replaceLegacyUrlPlaceholders(shortcut),
        };
      }

      shortcut = { ...shortcut }; // clone because we don't want to modify the database

      if (shortcut.include !== undefined) {
        const includedShortcut = await this.getShortcutByIncludeDefinition(
          shortcut.include,
          overrideNamespaces,
          --maxDepth,
        );
        if (includedShortcut === undefined) {
          // We don't return partial shortcuts (for example title without url would be useless).
          return undefined;
        }
        delete shortcut['include'];
        shortcut = {
          ...includedShortcut,
          ...shortcut,
        };
      }

      // TODO: add support for "short notation" where shortcut is just a string instead of an object ("examplekeyword 1: http://www.example.com/?q=<param1>") - it should be mapped to match the Shortcut type

      return shortcut;
    }

    return undefined; // keyword not found
  }

  public async getShortcutsByFulltextSearch(normalizedQuery: string): Promise<Record<string, Shortcut>> {
    const results: Record<string, Shortcut> = {};
    for (const namespace of this.namespaces.slice().reverse()) {
      const namespaceData = (await this.namespaceDispatcher.get(namespace)) ?? [];
      for (const key in namespaceData) {
        let shortcut = { ...namespaceData[key] }; // clone because we don't want to modify the database

        if (shortcut.include !== undefined) {
          const includedShortcut = await this.getShortcutByIncludeDefinition(shortcut.include, undefined);
          if (includedShortcut === undefined) {
            // We don't collect partial shortcuts (for example title without url would be useless).
            continue;
          }
          delete shortcut['include'];
          shortcut = {
            ...includedShortcut,
            ...shortcut,
          };
        }

        if (shortcutMatches(shortcut, normalizedQuery)) {
          results[key] = shortcut;
        }
      }
    }

    return results;
  }

  private async getShortcutByIncludeDefinition(
    include: IncludeDefinition,
    overrideNamespaces: NamespaceSource[] | undefined,
    maxDepth = 10,
  ): Promise<Shortcut | undefined> {
    if (include instanceof Array) {
      // List of references by namespace - namespace to search in usually comes from include, not from usual namespace priority list
      for (const includeEntry of include) {
        const referencedShortcut = await this.getShortcutByIncludeDefinition(
          includeEntry,
          overrideNamespaces,
          maxDepth,
        );
        if (referencedShortcut !== undefined) {
          return referencedShortcut;
        }
      }
      return undefined;
    }

    Logger.debug(`ShortcutFinder: Processing include: ${JSON.stringify(include)}`);

    if (typeof include === 'string') {
      // One single shortcut (string notation)
      return await this.getShortcutBySearchKey(this.mapSearchKey(include), overrideNamespaces, maxDepth);
    }

    if (include.key !== undefined) {
      // One single shortcut (object notation with "key" key)
      return await this.getShortcutBySearchKey(
        this.mapSearchKey(include.key),
        include.namespace ? [include.namespace] : overrideNamespaces,
        maxDepth,
      );
    }

    throw new DataDefinitionError('Encountered unexpected include definition.');
  }

  private mapSearchKey(searchKey: string): string {
    return searchKey.replace('<$language>', this.language);
  }
}

function replaceLegacyUrlPlaceholders(url: string): string {
  const placeholderRe = /{%([^}]+)}/g;
  let replacedUrl = url;
  for (const match of replacedUrl.matchAll(placeholderRe)) {
    replacedUrl = replacedUrl.replace(match[0], `<${match[1]}>`);
  }

  return replacedUrl;
}
