#!/usr/bin/env node

import { QueryProcessingResultStatus, QueryProcessor } from '../core/QueryProcessor.js';
import { CliEnvironment } from './CliEnvironment.js';
import { spawn } from 'child_process';
import { getCliConfig } from './CliConfig.js';
import { QxsError, UsageError } from '../Error.js';
import { NamespaceDispatcher } from '../core/namespaces/NamespaceDispatcher.js';
import { ObjectShortcutDatabase } from '../core/database/ObjectShortcutDatabase.js';
import { InPlaceNamespaceSourceHandler } from '../core/namespaces/InPlaceNamespaceSourceHandler.js';
import { UrlNamespaceSourceHandler } from '../core/namespaces/UrlNamespaceSourceHandler.js';
import { GithubNamespaceSourceHandler } from '../core/namespaces/GithubNamespaceSourceHandler.js';
import { RemoteSingleJsonNamespaceSourceHandler } from '../core/namespaces/RemoteSingleJsonNamespaceSourceHandler.js';
import { Logger } from '../core/Logger.js';
import { Command } from 'commander';

async function main(): Promise<void> {
  if (process.argv.length < 3) {
    console.error(`Usage: qxs <command>`);
    return;
  }

  // Logger.setVerbosity(1);
  Logger.setVerbosity(1);

  // TODO: add useful command line options (commander.js). Examples:
  // --search - Perform a search, similar to trovu.net homepage
  // --show - Display detailed information about a shortcut
  // --output - Just output URL, don't open browser
  // --config "{...}" - Config overlay
  // --configFile "..." - Config file path
  // --verbose Debug
  // --interactive - Read from stdin; preview result

  try {
    const program = new Command();
    program.name('qxs');
    program.description("quick access to trovu.net's shortcut database");
    program.argument('<query>');
    program.option('-v, --verbose', 'Write debug output');
    program.option('-o, --output', "Write URL to standard output only, don't call browser");
    program.option('-f, --fetch', 'Fetch URL and write content to standard output');
    program.passThroughOptions();
    program.parse();

    const opts = program.opts();

    if (opts['output'] === true && opts['fetch'] === true) {
      throw new UsageError('Cannot use --output and --fetch options at the same time.');
    }

    if (opts['verbose'] === true) {
      Logger.setVerbosity(3);
    }

    // Use all following args to make usage of quotes unnecessary
    const query = program.args.join(' ');

    const cliConfig = getCliConfig();
    const cliEnvironment = new CliEnvironment(cliConfig);
    const namespaceDispatcher = new NamespaceDispatcher([
      // new LocalIndividualYamlNamespaceSourceHandler(cliConfig.shortcutsDir),
      new RemoteSingleJsonNamespaceSourceHandler(cliConfig.singleDataSourceUrl),
      // new RemoteIndividualYamlNamespaceSourceHandler(cliConfig.individualShortcutsBaseUrl),
      new InPlaceNamespaceSourceHandler(),
      new UrlNamespaceSourceHandler(),
      new GithubNamespaceSourceHandler(),
    ]);
    const shortcutDatabase = new ObjectShortcutDatabase(namespaceDispatcher);
    const queryProcessor = new QueryProcessor(cliEnvironment, shortcutDatabase);

    Logger.debug(`Processing query "${query}"...`);
    const result = await queryProcessor.process(query);

    switch (result.status) {
      case QueryProcessingResultStatus.Success: {
        if (result.url === undefined) {
          console.error(`No url returned.`);
          return;
        }
        if (opts['output'] === true) {
          outputUrl(result.url);
        } else if (opts['fetch'] === true) {
          await fetchUrl(result.url);
        } else {
          openBrowser(result.url, cliConfig.browser);
        }
        break;
      }

      case QueryProcessingResultStatus.Deprecated: {
        const date = result.deprecated?.created ?? 'an unknown date';
        const alternativeQuery = result?.deprecated?.alternativeQuery;
        let message = `This shortcut is deprecated since ${date}.`;
        if (alternativeQuery !== undefined) {
          message += ` Try the following query as replacement: "${alternativeQuery}".`;
        }
        console.error(message);
        break;
      }

      case QueryProcessingResultStatus.NotFound: {
        Logger.error('Command not found.');
        break;
      }
    }
  } catch (e) {
    if (e instanceof QxsError) {
      console.error(`error: ${e.message}`);
    } else {
      console.error(e); // show stack trace for unexpected errors
    }
  }
}

function outputUrl(url: string): void {
  process.stdout.write(url);
}

async function fetchUrl(url: string): Promise<void> {
  const response = await fetch(url);
  const content = await response.text();
  process.stdout.write(content);
}

function openBrowser(url: string, browserCommand: string): void {
  Logger.info(`Opening ${url}`);
  const process = spawn(browserCommand, [url], {
    detached: true,
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  process.unref();
}

await main();
