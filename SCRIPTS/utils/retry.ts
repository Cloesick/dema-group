import { logger } from './logger';

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  timeout?: number;
  backoff?: 'linear' | 'exponential';
}

class RetryService {
  private readonly defaultOptions: Required<RetryOptions> = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    timeout: 30000,
    backoff: 'exponential'
  };

  async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    let attempt = 1;
    let delay = opts.initialDelay;

    while (true) {
      try {
        return await fn();
      } catch (error) {
        if (attempt >= opts.maxAttempts) {
          throw error;
        }

        logger.warn(`Retry attempt ${attempt} failed`, {
          metadata: {
            error: error instanceof Error ? error.message : String(error),
            attempt,
            delay
          }
        });

        await new Promise(resolve => setTimeout(resolve, delay));

        attempt++;
        delay = this.calculateNextDelay(delay, opts);
      }
    }
  }

  private calculateNextDelay(
    currentDelay: number,
    options: Required<RetryOptions>
  ): number {
    const nextDelay = options.backoff === 'exponential'
      ? currentDelay * 2
      : currentDelay + options.initialDelay;

    return Math.min(nextDelay, options.maxDelay);
  }
}

export const retry = new RetryService();
