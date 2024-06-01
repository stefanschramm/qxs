import { NamespaceSource, ShortcutSearchKeyMap } from '../Environment.js';
import { NamespaceSourceHandler } from './NamespaceDispatcher.js';
import { DataDefinitionError, ImplementationError, UsageError } from '../../Error.js';
import yaml from 'yaml';
import { Logger } from '../Logger.js';

/**
 * Handler for official namespaces
 *
 * This handler is slow because it fetches every namespace individually, but it can be used to directly test public repositories.
 */
export class RemoteIndividualYamlNamespaceSourceHandler implements NamespaceSourceHandler {
  private readonly cache: Record<string, ShortcutSearchKeyMap> = {};

  /**
   * @param baseUrl Example: https://raw.githubusercontent.com/trovu/trovu/master/data/shortcuts/
   */
  public constructor(private readonly baseUrl: string) {}

  public supports(source: NamespaceSource): boolean {
    return typeof source === 'string';
  }

  public async get(source: NamespaceSource): Promise<ShortcutSearchKeyMap> {
    if (typeof source !== 'string') {
      throw new ImplementationError('NamespaceSource not supported by RemoteIndividualNamespaceSourceHandler.');
    }

    if (this.cache[source] === undefined) {
      await this.load(source);
    }

    return this.cache[source];
  }

  private async load(namespace: string): Promise<void> {
    try {
      const url = `${this.baseUrl}/${namespace}.yml`;
      Logger.debug(`RemoteIndividualYamlNamespaceSourceHandler: Loading ${url}`);
      const response = await fetch(url);
      const content = await response.text();
      const namespaceData = yaml.parse(content);
      this.cache[namespace] = namespaceData;
    } catch (e) {
      if (e instanceof yaml.YAMLParseError) {
        throw new DataDefinitionError(`Unable to parse data for namespace "${namespace}": {e.message}`);
      } else {
        const message =
          e instanceof Error
            ? `Unable to load data for namespace "${namespace}": ${e.message}`
            : `Unable to load data for namespace "${namespace}.`;
        throw new UsageError(message);
      }
    }
  }
}
