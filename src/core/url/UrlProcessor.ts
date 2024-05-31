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
    let i = 0;
    for (const match of replacedUrl.matchAll(argumentPlaceholderRe)) {
      const replacement = argumentProcessor.process(match[0], args[i]);
      replacedUrl = replacedUrl.replace(match[0], encodeURIComponent(replacement));
      i++;
    }

    return replacedUrl;
  }
}
