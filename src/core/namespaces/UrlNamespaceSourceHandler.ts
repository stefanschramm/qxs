import { DataDefinitionError, ImplementationError, UsageError } from '../../Error.js';
import { NamespaceSource, ShortcutSearchKeyMap } from '../Environment.js';
import { Logger } from '../Logger.js';
import { NamespaceSourceHandler } from './NamespaceDispatcher.js';
import yaml from 'yaml';

export class UrlNamespaceSourceHandler implements NamespaceSourceHandler {
  private cache: Record<string, ShortcutSearchKeyMap> = {};

  public supports(source: NamespaceSource): boolean {
    return typeof source === 'object' && source.url !== undefined;
  }

  public async get(source: NamespaceSource): Promise<ShortcutSearchKeyMap> {
    if (!(typeof source === 'object' && source.url !== undefined)) {
      throw new ImplementationError('NamespaceSource not supported by UrlNamespaceSourceHandler.');
    }

    if (this.cache[source.url] === undefined) {
      await this.load(source.url);
    }

    return this.cache[source.url];
  }

  private async load(url: string): Promise<void> {
    try {
      Logger.debug(`UrlNamespaceSourceHandler: Loading shortcut data from ${url}`);
      const response = await fetch(url);
      const namespaceData = yaml.parse(await response.text());
      this.cache[url] = namespaceData;
    } catch (e) {
      if (e instanceof yaml.YAMLParseError) {
        throw new DataDefinitionError(`Unable to parse data for URL "${url}": {e.message}`);
      } else {
        const message =
          e instanceof Error
            ? `Unable to load data for for URL "${url}": ${e.message}`
            : `Unable to load data for for URL "${url}.`;
        throw new UsageError(message);
      }
    }
  }
}
