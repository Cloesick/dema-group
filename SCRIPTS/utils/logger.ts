export interface LogMetadata {
  [key: string]: unknown;
}

export interface Logger {
  info(message: string, metadata?: { metadata: LogMetadata }): void;
  warn(message: string, metadata?: { metadata: LogMetadata }): void;
  error(message: string, metadata?: { metadata: LogMetadata }): void;
}

class ConsoleLogger implements Logger {
  info(message: string, metadata?: { metadata: LogMetadata }): void {
    console.log(message, metadata);
  }

  warn(message: string, metadata?: { metadata: LogMetadata }): void {
    console.warn(message, metadata);
  }

  error(message: string, metadata?: { metadata: LogMetadata }): void {
    console.error(message, metadata);
  }
}

export const logger: Logger = new ConsoleLogger();
