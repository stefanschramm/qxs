export function getPlaceholders(urlPattern: string): Placeholder[] {
  return [...urlPattern.matchAll(/<([^>]+)>/g)].map(mapMatch);
}

export function getArgumentPlaceholderNames(urlPattern: string): string[] {
  return getPlaceholders(urlPattern)
    .filter((p) => p.type === PlaceholderType.ARGUMENT)
    .map((p) => p.name ?? '?');
}

function mapMatch(match: RegExpExecArray): Placeholder {
  const type = match[1].substring(0, 1) === '$' ? PlaceholderType.VARIABLE : PlaceholderType.ARGUMENT;
  return {
    pattern: match[0],
    name: type === PlaceholderType.ARGUMENT ? match[1] : undefined,
    type,
  };
}

export type Placeholder = {
  name: string | undefined;
  pattern: string;
  type: PlaceholderType;
};

export enum PlaceholderType {
  ARGUMENT,
  VARIABLE,
}
