import { ArgumentPlaceholderProcessor } from './ArgumentPlaceholderProcessor.js';
import { getPlaceholders, PlaceholderType } from './PlaceholderExtractor.js';
import { VariablePlaceholderProcessor } from './VariablePlaceholderProcessor.js';

export class UrlProcessor {
  constructor(
    private readonly language: string,
    private readonly country: string,
  ) {}

  public process(urlPattern: string, args: string[]): string {
    const allPlaceholders = getPlaceholders(urlPattern);

    let replacedUrl = urlPattern;

    // variable placeholders like <$language> etc.
    const variablePlaceholders = allPlaceholders.filter((p) => p.type === PlaceholderType.VARIABLE);
    const variablePlaceholderProcessor = new VariablePlaceholderProcessor(this.language, this.country);
    for (const placeholder of variablePlaceholders) {
      const replacement = variablePlaceholderProcessor.process(placeholder.pattern);
      replacedUrl = replacedUrl.replace(placeholder.pattern, replacement);
    }

    // normal placeholders with user-provided arguments
    const argumentPlaceholders = allPlaceholders.filter((p) => p.type === PlaceholderType.ARGUMENT);
    const argumentProcessor = new ArgumentPlaceholderProcessor();

    // join excessive arguments into last one
    const effectiveArguments = args.slice(0, argumentPlaceholders.length);
    for (let i = argumentPlaceholders.length; i < args.length; i++) {
      effectiveArguments[argumentPlaceholders.length - 1] += ',' + args[i];
    }

    for (let i = 0; i < argumentPlaceholders.length; i++) {
      const placeholder = argumentPlaceholders[i];
      const replacement = argumentProcessor.process(placeholder.pattern, effectiveArguments[i]);
      replacedUrl = replacedUrl.replace(placeholder.pattern, encodeURIComponent(replacement));
    }

    return replacedUrl;
  }
}
