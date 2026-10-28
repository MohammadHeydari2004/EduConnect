type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.VITE_APP_ENV === "development";
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    if (context) {
      return `${prefix} ${message} ${JSON.stringify(context)}`;
    }
    return `${prefix} ${message}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage("debug", message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(this.formatMessage("info", message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(this.formatMessage("warn", message, context));
    }
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage("error", message, context));
  }
}

export const logger = new Logger();