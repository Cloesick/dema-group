class Retry {
  static #instance;

  constructor() {
    if (Retry.#instance) {
      return Retry.#instance;
    }
    Retry.#instance = this;
  }

  async retry(fn, maxAttempts = 3, delay = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }
}

const retry = new Retry();
export { retry };
