import { NamespaceSource, ShortcutSearchKeyMap } from '../Environment.js';
import { NamespaceSourceHandler } from './NamespaceDispatcher.js';
import { ImplementationError } from '../../Error.js';

/**
 * Handler for official namespaces
 *
 * This handler is supposed to be used with Trovu's "copiled" JSON shortcut database
 */
export class RemoteSingleJsonNamespaceSourceHandler implements NamespaceSourceHandler {
  private cache: Record<string, ShortcutSearchKeyMap> = {};

  /**
   * @param url Example: https://trovu.net/data.json
   */
  public constructor(private readonly url: string) {}

  public supports(source: NamespaceSource): boolean {
    return typeof source === 'string';
  }

  public async get(source: NamespaceSource): Promise<ShortcutSearchKeyMap> {
    if (typeof source !== 'string') {
      throw new ImplementationError('NamespaceSource not supported by RemoteSingleNamespaceSourceHandler.');
    }

    if (this.cache[source] === undefined) {
      await this.load();
    }

    return this.cache[source];
  }

  private async load(): Promise<void> {
    const response = await fetch(this.url, { mode: 'no-cors' });
    const responseData = await response.json();
    this.cache = responseData['shortcuts'];
  }
}
