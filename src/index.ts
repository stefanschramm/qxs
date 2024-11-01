import { type Environment, type NamespaceSource } from './core/Environment';
import { Logger } from './core/Logger';
import { QueryProcessingResultStatus, QueryProcessor } from './core/QueryProcessor';
import { ObjectShortcutDatabase } from './core/database/ObjectShortcutDatabase';
import { type Shortcut } from './core/database/Shortcut';
import { GithubNamespaceSourceHandler } from './core/namespaces/GithubNamespaceSourceHandler';
import { InPlaceNamespaceSourceHandler } from './core/namespaces/InPlaceNamespaceSourceHandler';
import { NamespaceDispatcher } from './core/namespaces/NamespaceDispatcher';
import { RemoteSingleJsonNamespaceSourceHandler } from './core/namespaces/RemoteSingleJsonNamespaceSourceHandler';
import { UrlNamespaceSourceHandler } from './core/namespaces/UrlNamespaceSourceHandler';
import { getArgumentPlaceholderNames } from './core/url/PlaceholderExtractor';

// Temporary API for usage in qxs-web. Not expected to be stable!

export default {
  QueryProcessingResultStatus,
  QueryProcessor,
  ObjectShortcutDatabase,
  GithubNamespaceSourceHandler,
  InPlaceNamespaceSourceHandler,
  NamespaceDispatcher,
  RemoteSingleJsonNamespaceSourceHandler,
  UrlNamespaceSourceHandler,
  Logger,
  getArgumentPlaceholderNames,
};

export type { Environment, NamespaceSource, QueryProcessor, Shortcut };
