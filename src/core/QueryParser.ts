import { NamespaceSource } from './Environment';

export class QueryParser {
  public parse(query: string): ParsedQuery {
    const queryParts = query.trim().split(' ');
    const keywordParts = queryParts[0].split('.');
    const keyword = keywordParts[keywordParts.length - 1];
    const argumentParts = queryParts.slice(1).join(' ').trim();
    const args = argumentParts === '' ? [] : argumentParts.split(',').map((keyword: string) => keyword.trim());
    let language: string | undefined = undefined;
    let country: string | undefined = undefined;
    const additionalNamespaces: NamespaceSource[] = []; // actually all strings

    const prefixes = keywordParts.slice(0, keywordParts.length - 1);

    // Possibilities for prefixing keywords:
    // - No prefix: gn
    // - Language prefix: en.gn
    // - Country prefix: .gb.gn
    // - Country and language prefix: .gb.en.gn

    // Note: The actual Trovu implementation does a check whether country and language actually exists.

    if (prefixes.length > 0 && prefixes[0] === '') {
      prefixes.shift();
      if (prefixes[0].length === 2) {
        // If there was a leading '.' and the first prefix has 2 letters, its the country.
        country = prefixes.shift();
        additionalNamespaces.push(`.${country}`);
      }
    }

    for (const prefix of prefixes) {
      if (prefix.length === 2 && language === undefined) {
        // The frist (non-country) prefix with two letters is the language.
        language = prefix;
      }
      // All other prefixes are usual namespaces (like dictionary or custom)
      // Language is used as additional namespace too
      additionalNamespaces.push(prefix);
    }

    return {
      additionalNamespaces,
      keyword,
      args,
      language,
      country,
    };
  }
}

export type ParsedQuery = {
  additionalNamespaces: NamespaceSource[];
  keyword: string;
  args: string[];
  language: string | undefined;
  country: string | undefined;
};
