const defaultVerbosity = 0;
let verbosity = defaultVerbosity;
let handler = console;

export class Logger {
  static setVerbosity(v: number) {
    verbosity = v;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static setHandler(h: any) {
    handler = h;
  }

  static resetVebosity() {
    verbosity = defaultVerbosity;
  }

  static resetHandler() {
    handler = console;
  }

  static error(...args: string[]) {
    handler.error(...args);
  }

  static info(...args: string[]) {
    if (verbosity >= 1) {
      handler.info(...args);
    }
  }

  static log(...args: string[]) {
    if (verbosity >= 2) {
      handler.log(...args);
    }
  }

  static debug(...args: string[]) {
    if (verbosity >= 3) {
      handler.debug(...args);
    }
  }
}
