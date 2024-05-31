import { Environment, NamespaceSource } from '../core/Environment.js';
import { CliConfig } from './CliConfig.js';

export class CliEnvironment implements Environment {
  public constructor(private readonly cliConfig: CliConfig) {}

  public getNamespaces(): NamespaceSource[] {
    return this.cliConfig.namespaces;
  }

  public getCountry(): string {
    return this.cliConfig.country;
  }

  public getLanguage(): string {
    return this.cliConfig.language;
  }

  public getDefaultKeyword(): string | undefined {
    return this.cliConfig.defaultKeyword;
  }
}
