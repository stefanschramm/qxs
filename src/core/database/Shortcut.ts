/**
 * A procesed shortcut without "include" property
 */
export type Shortcut = {
  readonly url?: string;
  readonly title?: string;
  readonly deprecated?: {
    readonly alternative?: {
      readonly query: string;
    };
    readonly created: string;
  };
  // TODO: other properties?
};

/**
 * Raw shortcut definition as found in YAML/JSON data sets (including "include" properties)
 */
export type RawShortcut = Shortcut & {
  /** The include property is not readonly because we remove it while processing. */
  include?: IncludeDefinition;
};

// TODO: Support "Short notation" like "examplekeyword 1: http://www.example.com/?q=<param1>"

export type IncludeDefinition =
  | IncludeDefinition[]
  | string
  | {
      readonly key: string;
      readonly namespace?: string;
    };
