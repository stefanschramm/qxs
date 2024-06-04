import { RawShortcut } from './database/Shortcut.js';

export interface Environment {
  getCountry(): string;
  getLanguage(): string;
  /**
   * Namespaces in ascending priority (lowest first)
   */
  getNamespaces(): NamespaceSource[];
  getDefaultKeyword(): string | undefined;
}

export type NamespaceSource = OfficialNamespaceSource | ComplexNamespaceSource;

type OfficialNamespaceSource = string;

type ComplexNamespaceSource = {
  readonly name?: string;
  readonly url?: string;
  readonly github?: string;
  readonly file?: string;
  readonly shortcuts?: ShortcutSearchKeyMap;
};

export type ShortcutSearchKeyMap = Record<string, RawShortcut>;

/**
 * Common Environment dummy for unit tests
 */
export class EnvironmentDummy implements Environment {
  public constructor(
    private readonly defaultKeyword: string | undefined = undefined,
    private readonly namespaces: NamespaceSource[] = ['o', 'de', '.de'],
    private readonly country: string = 'de',
    private readonly language: string = 'de',
  ) {}

  public getNamespaces(): NamespaceSource[] {
    return this.namespaces;
  }

  public getCountry(): string {
    return this.country;
  }

  public getLanguage(): string {
    return this.language;
  }

  public getDefaultKeyword(): string | undefined {
    return this.defaultKeyword;
  }
}
