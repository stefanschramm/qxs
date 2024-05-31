import { ImplementationError } from '../../Error.js';
import { NamespaceSource, ShortcutSearchKeyMap } from '../Environment.js';

export interface NamespaceSourceHandler {
  supports(source: NamespaceSource): boolean;
  get(source: NamespaceSource): Promise<ShortcutSearchKeyMap>;
}

export class NamespaceDispatcher {
  public constructor(private readonly namespaceSourceHandlers: NamespaceSourceHandler[]) {}

  public async get(source: NamespaceSource): Promise<ShortcutSearchKeyMap> {
    for (const namespaceSourceHandler of this.namespaceSourceHandlers) {
      if (namespaceSourceHandler.supports(source)) {
        return await namespaceSourceHandler.get(source);
      }
    }

    throw new ImplementationError('No NamespaceSourceHandler found.');
  }
}
