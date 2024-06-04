import { NamespaceSource, ShortcutSearchKeyMap } from '../Environment.js';
import { NamespaceSourceHandler } from './NamespaceDispatcher.js';
import { ImplementationError } from '../../Error.js';
import { Logger } from '../Logger.js';

/**
 * Handler for official namespaces
 *
 * This handler is supposed to be used with Trovu's "copiled" JSON shortcut database
 */
export class RemoteSingleJsonNamespaceSourceHandler implements NamespaceSourceHandler {
  public static readonly QXS_DATA_SOURCE = 'https://qxs.kesto.de/data.json';
  private cache: Record<string, ShortcutSearchKeyMap> = {};

  /**
   * @param url Example: https://qxs.kesto.de/data.json
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
    Logger.debug(`RemoteSingleJsonNamespaceSourceHandler: Loading shortcut data from ${this.url}`);
    const response = await fetch(this.url, { mode: 'no-cors', signal: AbortSignal.timeout(30000) });
    const responseData = await response.json();
    this.cache = responseData['shortcuts'];
  }
}
