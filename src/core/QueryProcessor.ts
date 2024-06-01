import yaml from 'yaml';
import { type Environment } from './Environment.js';
import { QueryParser } from './QueryParser.js';
import { UrlProcessor } from './url/UrlProcessor.js';
import { DataDefinitionError, UsageError } from '../Error.js';
import { ShortcutDatabase } from './database/ShortcutDatabase.js';
import { Logger } from './Logger.js';

export class QueryProcessor {
  constructor(
    private readonly environment: Environment,
    private readonly database: ShortcutDatabase,
  ) {}

  public async process(query: string): Promise<QueryProcessingResult> {
    const queryParser = new QueryParser();
    const parsedQuery = queryParser.parse(query);
    // TODO: Where is country used? - Only in UrlProcesor/PlaceholderProcessor?
    // const country = parsedQuery.country ?? this.environment.getCountry();
    const language = parsedQuery.language ?? this.environment.getLanguage();
    const allNamespaces = [...this.environment.getNamespaces(), ...parsedQuery.additionalNamespaces];
    const namespaces = allNamespaces.filter((value, index) => allNamespaces.indexOf(value) === index); // make unique TODO: does === work for all?

    const shortcut = await this.database.getShortcut(
      parsedQuery.keyword,
      parsedQuery.args.length,
      language,
      namespaces,
    );

    Logger.debug(
      `QueryProcessor: Shortcut database returned:\n-----\n${yaml.stringify(shortcut, { lineWidth: 0 })}-----`,
    );

    if (shortcut === undefined) {
      const defaultKeyword = this.environment.getDefaultKeyword();
      if (defaultKeyword !== undefined) {
        return this.processDefaultKeyword(defaultKeyword, query);
      }
    }

    if (shortcut === undefined) {
      return { status: QueryProcessingResultStatus.NotFound };
    }

    if (shortcut.deprecated !== undefined) {
      return {
        status: QueryProcessingResultStatus.Deprecated,
        deprecated: {
          created: shortcut.deprecated.created,
          alternativeQuery: determineDeprecationAlternative(shortcut?.deprecated?.alternative?.query, parsedQuery.args),
        },
      };
    }

    // success

    if (shortcut.url === undefined) {
      throw new DataDefinitionError('shortcut.url was undefined although the result was not deprecated!?');
    }

    const urlProcessor = new UrlProcessor(language, this.environment.getCountry());

    const targetUrl = urlProcessor.process(shortcut.url, parsedQuery.args);

    return {
      status: QueryProcessingResultStatus.Success,
      url: targetUrl,
    };
  }

  private async processDefaultKeyword(defaultKeyword: string, query: string): Promise<QueryProcessingResult> {
    const defaultShortcut = await this.database.getShortcut(
      defaultKeyword,
      1,
      this.environment.getLanguage(),
      this.environment.getNamespaces(),
    );

    if (defaultShortcut === undefined) {
      throw new UsageError(`Default shortcut "${defaultKeyword}" was not found.`);
    }

    if (defaultShortcut.url === undefined) {
      throw new DataDefinitionError('defaultShortcut.url was undefined although the result was not deprecated!?');
    }

    const urlProcessor = new UrlProcessor(this.environment.getLanguage(), this.environment.getCountry());

    // here the complete (un-parsed) query is used as a single argument
    const targetUrl = urlProcessor.process(defaultShortcut.url, [query]);

    return {
      status: QueryProcessingResultStatus.Success,
      url: targetUrl,
    };
  }
}

type QueryProcessingResult = {
  status: QueryProcessingResultStatus;
  url?: string;
  deprecated?: {
    readonly alternativeQuery?: string | undefined;
    readonly created?: string | undefined;
  };
};

export enum QueryProcessingResultStatus {
  Success = 0,
  Deprecated,
  NotFound,
  // TODO: Are there more result states?
}

function determineDeprecationAlternative(alternative: string | undefined, args: string[]): string | undefined {
  if (alternative === undefined) {
    return undefined;
  }

  const placeholderRe = /<[^>]+>/g;
  const placeholderMatches = [...alternative.matchAll(placeholderRe)];

  if (placeholderMatches.length !== args.length) {
    throw new DataDefinitionError(
      `Number of arguments of deprecation alternative (${placeholderMatches.length}) does not match original shortcut's argument count (${args.length}).`,
    );
  }

  let populatedAlternative = alternative;
  for (let i = 0; i < placeholderMatches.length; i++) {
    populatedAlternative = populatedAlternative.replace(placeholderMatches[i][0], args[i]);
  }

  return populatedAlternative;
}
