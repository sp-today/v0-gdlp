// Logging utility for GDLP

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

export class Logger {
  private static instance: Logger

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatLog(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const dataStr = data ? JSON.stringify(data) : ""
    return `[${timestamp}] [${level}] ${message} ${dataStr}`
  }

  debug(message: string, data?: any): void {
    console.log(this.formatLog(LogLevel.DEBUG, message, data))
  }

  info(message: string, data?: any): void {
    console.log(this.formatLog(LogLevel.INFO, message, data))
  }

  warn(message: string, data?: any): void {
    console.warn(this.formatLog(LogLevel.WARN, message, data))
  }

  error(message: string, error?: Error | any): void {
    console.error(this.formatLog(LogLevel.ERROR, message, error))
  }

  critical(message: string, error?: Error | any): void {
    console.error(this.formatLog(LogLevel.CRITICAL, message, error))
  }
}

export const logger = Logger.getInstance()
