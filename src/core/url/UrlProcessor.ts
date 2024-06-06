import { ArgumentPlaceholderProcessor } from './ArgumentPlaceholderProcessor.js';
import { VariablePlaceholderProcessor } from './VariablePlaceholderProcessor.js';

export class UrlProcessor {
  constructor(
    private readonly language: string,
    private readonly country: string,
  ) {}

  public process(urlPattern: string, args: string[]): string {
    let replacedUrl = urlPattern;

    // variable placeholders like <$language> etc.
    const variablePlaceholderRe = /<\$[^>]+>/g;
    const variablePlaceholderProcessor = new VariablePlaceholderProcessor(this.language, this.country);
    for (const match of replacedUrl.matchAll(variablePlaceholderRe)) {
      const replacement = variablePlaceholderProcessor.process(match[0]);
      replacedUrl = replacedUrl.replace(match[0], replacement);
    }

    // normal placeholders with user-provided arguments
    const argumentPlaceholderRe = /<[^>]+>/g;
    const argumentProcessor = new ArgumentPlaceholderProcessor();

    const placeholders = [...replacedUrl.matchAll(argumentPlaceholderRe)];

    // join excessive arguments into last one
    const effectiveArguments = args.slice(0, placeholders.length);
    for (let i = placeholders.length; i < args.length; i++) {
      effectiveArguments[placeholders.length - 1] += ',' + args[i];
    }

    for (let i = 0; i < placeholders.length; i++) {
      const match = placeholders[i];
      const replacement = argumentProcessor.process(match[0], effectiveArguments[i]);
      replacedUrl = replacedUrl.replace(match[0], encodeURIComponent(replacement));
    }

    return replacedUrl;
  }
}
