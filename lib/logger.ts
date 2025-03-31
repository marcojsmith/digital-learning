import { randomUUID } from 'crypto';
import chalk from 'chalk'; // Import chalk
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  correlationId?: string; // Optional for general logs, required for request logs
  message: string;
  context?: Record<string, unknown>;
  durationMs?: number;
  tokenUsage?: number; // Placeholder for future implementation
}

// Function to determine log level from environment variable
function getLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  if (envLevel === 'debug' || envLevel === 'info' || envLevel === 'warn' || envLevel === 'error') {
    return envLevel;
  }
  // Default based on NODE_ENV or fallback to 'info'
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

// Basic configuration (can be expanded)
const config = {
  logLevel: getLogLevel(),
};

const levelSeverity: Record<LogLevel, number> = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};
function shouldLog(level: LogLevel): boolean {
  return levelSeverity[level] >= levelSeverity[config.logLevel];
}

// Define colors for log levels
const levelColor: Record<LogLevel, chalk.Chalk> = {
    debug: chalk.blue,
    info: chalk.green,
    warn: chalk.yellow,
    error: chalk.red,
};

function formatLog(entry: LogEntry): string {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  let output: string;

  if (isDevelopment) {
    // Pretty-print JSON in development
    output = JSON.stringify(entry, null, 2);
    // Apply color based on level
    const color = levelColor[entry.level] || chalk.white; // Default to white if level is somehow invalid
    return color(output);
  } else {
    // Compact JSON for production
    output = JSON.stringify(entry);
    return output;
  }
}

// --- Core Logger Class ---

class Logger {
  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    if (!shouldLog(level)) {
      return;
    }
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
    console[level](formatLog(entry)); // Use appropriate console method
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown> | Error) {
     const errorContext: Record<string, unknown> = {};
     if (context instanceof Error) {
         errorContext.error = {
             message: context.message,
             stack: context.stack,
             name: context.name,
         };
     } else if (context) {
         Object.assign(errorContext, context);
     }
     this.log('error', message, errorContext);
  }

  // --- Request-Specific Logging ---

  startRequest(initialContext?: Record<string, unknown>): RequestLogger {
    const correlationId = randomUUID();
    const startTime = Date.now();
    this.info('Request started', { ...initialContext, correlationId });
    return new RequestLogger(this, correlationId, startTime, initialContext);
  }
}

// --- Request Logger Helper Class ---

class RequestLogger {
  private logger: Logger;
  private correlationId: string;
  private startTime: number;
  private requestContext: Record<string, unknown>;
  private ended: boolean = false; // Flag to track if endRequest has been called
  private llmStartTime?: number; // For LLM specific timing

  constructor(logger: Logger, correlationId: string, startTime: number, initialContext?: Record<string, unknown>) {
    this.logger = logger;
    this.correlationId = correlationId;
    this.startTime = startTime;
    this.requestContext = { ...initialContext, correlationId }; // Ensure correlationId is always present
  }

  private enrichContext(context?: Record<string, unknown>): Record<string, unknown> {
      return { ...this.requestContext, ...context };
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.logger.debug(message, this.enrichContext(context));
  }

  info(message: string, context?: Record<string, unknown>) {
    this.logger.info(message, this.enrichContext(context));
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.logger.warn(message, this.enrichContext(context));
  }

  error(message: string, context?: Record<string, unknown> | Error) {
    const errorContext = context instanceof Error ? { error: { message: context.message, stack: context.stack, name: context.name } } : context;
    this.logger.error(message, this.enrichContext(errorContext));
  }

  // --- Specific Request Lifecycle Methods ---

  logPayload(type: 'request' | 'llm_request' | 'llm_response' | 'response', payload: unknown) {
    // Only log full payloads in debug mode for security/privacy
    if (config.logLevel === 'debug') {
        this.debug(`Payload received: ${type}`, { payload });
    } else {
        // In production, maybe log size or just confirmation
        const size = typeof payload === 'string' ? payload.length : JSON.stringify(payload)?.length ?? 0;
        this.info(`Payload received: ${type}`, { payloadSize: size });
    }

    // Start LLM timer when sending request to LLM
    if (type === 'llm_request') {
        this.llmStartTime = Date.now();
    }
  }

  logLlmResult(result: unknown, tokenUsage?: number) {
      const llmDurationMs = this.llmStartTime ? Date.now() - this.llmStartTime : undefined;
      const context: Record<string, unknown> = { llmDurationMs };
      if (tokenUsage !== undefined) {
          context.tokenUsage = tokenUsage;
      }
      // Log full result only in debug
      if (config.logLevel === 'debug') {
          context.llmResult = result;
          this.debug('LLM response received', context);
      } else {
          this.info('LLM response received', context);
      }
  }


  endRequest(status: number, finalContext?: Record<string, unknown>) {
    if (this.ended) {
        this.warn("endRequest called multiple times for the same request.");
        return; // Prevent double logging
    }
    this.ended = true; // Set the flag

    const durationMs = Date.now() - this.startTime;
    const context = this.enrichContext({ ...finalContext, durationMs, status });
    if (status >= 500) {
        this.logger.error('Request finished with server error', context);
    } else if (status >= 400) {
        this.logger.warn('Request finished with client error', context);
    } else {
        this.logger.info('Request finished successfully', context);
    }
  }

  public hasEnded(): boolean {
    return this.ended;
  }
}
// Export a singleton instance
export const logger = new Logger();