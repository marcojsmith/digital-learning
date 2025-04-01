import { randomUUID } from 'crypto';
import chalk from 'chalk'; // Import chalk
/**
 * @type LogLevel
 * Defines the possible logging levels.
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * @interface LogEntry
 * Represents the structure of a single log entry.
 */
interface LogEntry {
  /** ISO 8601 timestamp of the log event. */
  timestamp: string;
  /** The severity level of the log. */
  level: LogLevel;
  /** Optional unique identifier to correlate related log entries, especially across requests. */
  correlationId?: string;
  /** The main log message. */
  message: string;
  /** Optional structured context data associated with the log. */
  context?: Record<string, unknown>;
  /** Optional duration in milliseconds, typically used for request/operation timing. */
  durationMs?: number;
  /** Optional token usage count, relevant for LLM interactions. */
  tokenUsage?: number; // TODO: Implement actual token usage tracking
}

/**
 * Determines the log level based on environment variables.
 * Reads `LOG_LEVEL`, falling back to `NODE_ENV` ('production' -> 'info', otherwise 'debug').
 * @returns The determined LogLevel.
 * @private
 */
function getLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  if (envLevel === 'debug' || envLevel === 'info' || envLevel === 'warn' || envLevel === 'error') {
    return envLevel;
  }
  // Default based on NODE_ENV or fallback to 'info'
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

/**
 * Basic logger configuration.
 * @internal
 */
const config = {
  /** The current active logging level. Messages below this level will be ignored. */
  logLevel: getLogLevel(),
};

const levelSeverity: Record<LogLevel, number> = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};
/**
 * Checks if a message with the given level should be logged based on the current config.
 * @param level - The level of the message to check.
 * @returns True if the message should be logged, false otherwise.
 * @private
 */
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

/**
 * Formats a LogEntry object into a string for output.
 * Uses pretty-printed, colored JSON in development and compact JSON in production.
 * @param entry - The LogEntry to format.
 * @returns The formatted log string.
 * @private
 */
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

/**
 * @class Logger
 * Provides core logging functionalities (debug, info, warn, error).
 * Handles log levels, formatting, and outputting to the console.
 * Also acts as a factory for creating request-specific loggers.
 */
class Logger {
  /**
   * Internal method to handle the actual logging logic.
   * Checks log level, creates LogEntry, formats, and outputs.
   * @param level - The log level.
   * @param message - The log message.
   * @param context - Optional context data.
   * @private
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
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

  /**
   * Logs a debug message. Typically used for detailed diagnostic information.
   * @param message - The message to log.
   * @param context - Optional context data.
   * @public
   */
  public debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  /**
   * Logs an informational message. Used for general operational messages.
   * @param message - The message to log.
   * @param context - Optional context data.
   * @public
   */
  public info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Logs a warning message. Indicates potential issues that don't halt execution.
   * @param message - The message to log.
   * @param context - Optional context data.
   * @public
   */
  public warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Logs an error message. Used for errors and exceptions.
   * Automatically extracts details if an Error object is passed as context.
   * @param message - The message to log.
   * @param context - Optional context data or an Error object.
   * @public
   */
  public error(message: string, context?: Record<string, unknown> | Error): void {
    const errorContext: Record<string, unknown> = {};
    if (context instanceof Error) {
      // Standardize error object logging
      errorContext.error = {
        message: context.message,
        name: context.name,
        stack: context.stack, // Include stack trace
      };
    } else if (context) {
      // Merge provided context
      Object.assign(errorContext, context);
    }
     this.log('error', message, errorContext);
  }

  // --- Request-Specific Logging ---

  /**
   * Starts a new request logging session.
   * Creates a RequestLogger instance with a unique correlation ID and start time.
   * Logs a "Request started" message.
   * @param initialContext - Optional context data to associate with the entire request lifecycle.
   * @returns A new RequestLogger instance.
   * @public
   */
  public startRequest(initialContext?: Record<string, unknown>): RequestLogger {
    const correlationId = randomUUID();
    const startTime = Date.now();
    this.info('Request started', { ...initialContext, correlationId });
    return new RequestLogger(this, correlationId, startTime, initialContext);
  }
}

// --- Request Logger Helper Class ---

/**
 * @class RequestLogger
 * Provides logging methods specific to a single request lifecycle.
 * Automatically includes correlation ID and calculates request duration.
 * Offers methods for logging specific events like payloads and LLM interactions.
 */
class RequestLogger {
  private readonly logger: Logger;
  private readonly correlationId: string;
  private readonly startTime: number;
  private readonly requestContext: Record<string, unknown>;
  private ended: boolean = false;
  private llmStartTime?: number;

  /**
   * Creates an instance of RequestLogger.
   * @param logger - The parent Logger instance.
   * @param correlationId - The unique ID for this request.
   * @param startTime - The timestamp (Date.now()) when the request started.
   * @param initialContext - Initial context data for the request.
   * @internal Should only be instantiated by Logger.startRequest
   */
  constructor(
    logger: Logger,
    correlationId: string,
    startTime: number,
    initialContext?: Record<string, unknown>
  ) {
    this.logger = logger;
    this.correlationId = correlationId;
    this.startTime = startTime;
    this.requestContext = { ...initialContext, correlationId }; // Ensure correlationId is always present
  }

  /**
   * Merges provided context with the base request context (including correlationId).
   * @param context - Additional context to merge.
   * @returns The combined context object.
   * @private
   */
  private enrichContext(context?: Record<string, unknown>): Record<string, unknown> {
    return { ...this.requestContext, ...context };
  }

  /**
   * Logs a debug message within the request context.
   * @param message - The message to log.
   * @param context - Optional context data specific to this log entry.
   * @public
   */
  public debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(message, this.enrichContext(context));
  }

  /**
   * Logs an informational message within the request context.
   * @param message - The message to log.
   * @param context - Optional context data specific to this log entry.
   * @public
   */
  public info(message: string, context?: Record<string, unknown>): void {
    this.logger.info(message, this.enrichContext(context));
  }

  /**
   * Logs a warning message within the request context.
   * @param message - The message to log.
   * @param context - Optional context data specific to this log entry.
   * @public
   */
  public warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(message, this.enrichContext(context));
  }

  /**
   * Logs an error message within the request context.
   * Automatically extracts details if an Error object is passed as context.
   * @param message - The message to log.
   * @param context - Optional context data or an Error object.
   * @public
   */
  public error(message: string, context?: Record<string, unknown> | Error): void {
    let errorContext: Record<string, unknown> | undefined;
    if (context instanceof Error) {
      errorContext = {
        error: {
          message: context.message,
          name: context.name,
          stack: context.stack,
        },
      };
    } else {
      errorContext = context;
    }
    this.logger.error(message, this.enrichContext(errorContext));
  }

  // --- Specific Request Lifecycle Methods ---

  /**
   * Logs request or response payloads.
   * Logs full payload only in debug mode; otherwise, logs size confirmation.
   * Starts LLM timer if logging an 'llm_request'.
   * @param type - The type of payload being logged.
   * @param payload - The actual payload data.
   * @public
   */
  public logPayload(
    type: 'request' | 'llm_request' | 'llm_response' | 'response',
    payload: unknown
  ): void {
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

  /**
   * Logs the result received from an LLM, including duration and token usage.
   * Logs full result only in debug mode.
   * @param result - The result data from the LLM.
   * @param tokenUsage - Optional number of tokens used.
   * @public
   */
  public logLlmResult(result: unknown, tokenUsage?: number): void {
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


  /**
   * Logs the end of the request lifecycle.
   * Calculates total request duration and logs a final message indicating success or failure based on status code.
   * Prevents duplicate logging if called more than once.
   * @param status - The HTTP status code (or similar status indicator) of the response.
   * @param finalContext - Optional final context data to include in the end log entry.
   * @public
   */
  public endRequest(status: number, finalContext?: Record<string, unknown>): void {
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

  /**
   * Checks if the `endRequest` method has already been called for this logger instance.
   * @returns True if `endRequest` has been called, false otherwise.
   * @public
   */
  public hasEnded(): boolean {
    return this.ended;
  }
}
/**
 * Singleton instance of the Logger class.
 * Import this instance to use the logger throughout the application.
 * @example
 * import { logger } from '@/lib/logger';
 * logger.info('Application started');
 * const reqLog = logger.startRequest({ userId: '123' });
 * try {
 *   // ... handle request ...
 *   reqLog.info('Processed successfully');
 *   reqLog.endRequest(200);
 * } catch (error) {
 *   reqLog.error('Request failed', error);
 *   reqLog.endRequest(500);
 * }
 */
export const logger = new Logger();