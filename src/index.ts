import { QueryProcessingResultStatus, QueryProcessor } from './core/QueryProcessor';
import { ObjectShortcutDatabase } from './core/database/ObjectShortcutDatabase';
import { GithubNamespaceSourceHandler } from './core/namespaces/GithubNamespaceSourceHandler';
import { InPlaceNamespaceSourceHandler } from './core/namespaces/InPlaceNamespaceSourceHandler';
import { NamespaceDispatcher } from './core/namespaces/NamespaceDispatcher';
import { RemoteSingleJsonNamespaceSourceHandler } from './core/namespaces/RemoteSingleJsonNamespaceSourceHandler';
import { UrlNamespaceSourceHandler } from './core/namespaces/UrlNamespaceSourceHandler';
import { type NamespaceSource, type Environment } from './core/Environment';
import { Logger } from './core/Logger';

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
};

export type { Environment, NamespaceSource };
