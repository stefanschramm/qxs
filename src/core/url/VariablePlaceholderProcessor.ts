import { DataDefinitionError } from '../../Error.js';

export class VariablePlaceholderProcessor {
  public constructor(
    private readonly language: string,
    private readonly country: string,
  ) {}

  public process(placeholder: string): string {
    if (placeholder === '<$language>') {
      return this.language;
    }

    if (placeholder === '<$country: {}>') {
      return this.country;
    }

    // TODO: <$now ...>

    throw new DataDefinitionError(`Encountered invalid variable placeholder: "${placeholder}"`);
  }
}
