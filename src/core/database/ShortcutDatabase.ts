import { NamespaceSource } from '../Environment';
import { Shortcut } from './Shortcut';

export interface ShortcutDatabase {
  /**
   * @param language Language to use when replacing search keys of includes
   */
  getShortcut(
    keyword: string,
    argumentCount: number,
    language: string,
    namespaces: NamespaceSource[],
  ): Promise<Shortcut | undefined>;
}
