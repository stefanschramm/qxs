import yaml from 'yaml';
import fs from 'fs';
import os from 'os';

import path from 'path';
import { fileURLToPath } from 'url';
import { NamespaceSource } from '../core/Environment.js';
import { Logger } from '../core/Logger.js';

export type CliConfig = {
  readonly browser: string;
  readonly shortcutsDir: string;
  readonly singleDataSourceUrl: string;
  readonly individualShortcutsBaseUrl: string;
} & TrovuConfig;

/**
 * Trovu config as described in https://trovu.net/docs/users/advanced/
 *
 * Example: https://github.com/trovu/trovu-data-user/blob/master/config.yml
 */
type TrovuConfig = {
  readonly namespaces: NamespaceSource[];
  readonly language: string;
  readonly country: string;
  readonly defaultKeyword?: string | undefined;
};

export function getCliConfig(configFile: string | undefined = undefined): CliConfig {
  let effectiveConfigFile: string | undefined;
  if (configFile === undefined) {
    const defaultConfigFile = getDefaultConfigFile();
    if (fs.existsSync(defaultConfigFile)) {
      effectiveConfigFile = defaultConfigFile;
    }
  }
  if (effectiveConfigFile === undefined) {
    return getDefaultConfig();
  }
  Logger.debug(`CliConfig: Loading ${effectiveConfigFile}`);
  const additionalConfiguration = yaml.parse(fs.readFileSync(effectiveConfigFile).toString());

  return {
    ...getDefaultConfig(),
    ...additionalConfiguration,
  };
}

function getDefaultConfigFile(): string {
  return `${os.homedir()}/.qxs.yml`;
}

function getDefaultConfig(): CliConfig {
  const here = path.dirname(fileURLToPath(import.meta.url));

  return {
    namespaces: ['o', 'de', '.de'],
    country: 'de',
    language: 'de',
    browser: 'open', // TODO: open is xdg-open. Check if this works on other OSes.
    shortcutsDir: `${here}/../../data/shortcuts`,
    singleDataSourceUrl: 'https://qxs.kesto.de/data.json',
    individualShortcutsBaseUrl: 'https://raw.githubusercontent.com/trovu/trovu/master/data/shortcuts/', // TODO: maybe pattern instead of base url would be better
    defaultKeyword: undefined,
  };
}
