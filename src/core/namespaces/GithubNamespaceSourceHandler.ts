import { DataDefinitionError, ImplementationError, UsageError } from '../../Error.js';
import { NamespaceSource, ShortcutSearchKeyMap } from '../Environment.js';
import { NamespaceSourceHandler } from './NamespaceDispatcher.js';
import yaml from 'yaml';

export class GithubNamespaceSourceHandler implements NamespaceSourceHandler {
  private cache: Record<string, ShortcutSearchKeyMap> = {};

  public supports(source: NamespaceSource): boolean {
    return typeof source === 'object' && source.github !== undefined;
  }

  public async get(source: NamespaceSource): Promise<ShortcutSearchKeyMap> {
    if (!(typeof source === 'object' && source.github !== undefined)) {
      throw new ImplementationError('NamespaceSource not supported by GithubNamespaceSourceHandler.');
    }

    if (this.cache[source.github] === undefined) {
      await this.load(source.github);
    }

    return this.cache[source.github];
  }

  private async load(username: string): Promise<void> {
    try {
      const url = `https://raw.githubusercontent.com/${username}/trovu-data-user/master/shortcuts.yml`;
      const response = await fetch(url);
      const namespaceData = yaml.parse(await response.text());
      this.cache[username] = namespaceData;
    } catch (e) {
      if (e instanceof yaml.YAMLParseError) {
        throw new DataDefinitionError(`Unable to parse data for GitHub user "${username}": {e.message}`);
      } else {
        const message =
          e instanceof Error
            ? `Unable to load data for for GitHub user "${username}": ${e.message}`
            : `Unable to load data for for GitHub user "${username}.`;
        throw new UsageError(message);
      }
    }
  }
}
