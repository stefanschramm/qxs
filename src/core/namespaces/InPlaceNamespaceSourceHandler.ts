import { NamespaceSource, ShortcutSearchKeyMap } from '../Environment.js';
import { NamespaceSourceHandler } from './NamespaceDispatcher.js';
import { ImplementationError } from '../../Error.js';

/**
 * Handler for namespace data that is defined directly within the config
 */
export class InPlaceNamespaceSourceHandler implements NamespaceSourceHandler {
  public supports(source: NamespaceSource): boolean {
    return typeof source === 'object' && source.shortcuts !== undefined;
  }

  public async get(source: NamespaceSource): Promise<ShortcutSearchKeyMap> {
    if (typeof source !== 'object' || source.shortcuts === undefined) {
      throw new ImplementationError('NamespaceSource not supported by InPlaceNamespaceSourceHandler.');
    }

    return source.shortcuts;
  }
}
