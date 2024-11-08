import yaml from 'yaml';
import { DataDefinitionError } from '../../Error.js';

export class VariablePlaceholderProcessor {
  public constructor(
    private readonly language: string,
    private readonly country: string,
    private readonly now: Date = new Date(),
  ) {}

  public process(placeholder: string): string {
    if (placeholder === '<$language>') {
      return this.language;
    }

    if (placeholder === '<$country: {}>') {
      return this.country;
    }

    if (placeholder.startsWith('<$now')) {
      const parsed = yaml.parse(placeholder.substring(1, placeholder.length - 1));
      const format = parsed['$now']['output'] ?? null;

      if (format === null) {
        throw new DataDefinitionError(`Unable to parse $now-placeholder: "${placeholder}"`);
      }

      return mapDate(this.now, format);
    }

    throw new DataDefinitionError(`Encountered invalid variable placeholder: "${placeholder}"`);
  }
}

function mapDate(now: Date, formatString: string): string {
  const day = now.getDate().toString().padStart(2, '0');
  const month = (1 + now.getMonth()).toString().padStart(2, '0');
  const year = now.getFullYear().toString().padStart(4, '0');
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');

  let formatted = formatString;
  formatted = formatString.replace(/YYYY/g, year);
  formatted = formatted.replace(/MM/g, month);
  formatted = formatted.replace(/DD/g, day);
  formatted = formatted.replace(/HH/g, hour);
  formatted = formatted.replace(/mm/g, minute);

  return formatted;
}
