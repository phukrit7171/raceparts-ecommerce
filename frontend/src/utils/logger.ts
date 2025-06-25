type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

class Logger {
  private level: LogLevel;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 100;

  constructor(level: LogLevel = 'debug') {
    this.level = level;
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta as object)
    };

    // Add to in-memory logs
    this.logs.push(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Store in localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const storedLogs = JSON.parse(localStorage.getItem('app_logs') || '[]');
        storedLogs.push(entry);
        if (storedLogs.length > this.MAX_LOGS) {
          storedLogs.shift();
        }
        localStorage.setItem('app_logs', JSON.stringify(storedLogs));
      } catch (error) {
        console.error('Failed to write to localStorage:', error);
      }
    }

    // Console output with colors
    const colors = {
      debug: 'color: #6c757d',
      info: 'color: #0dcaf0',
      warn: 'color: #ffc107',
      error: 'color: #dc3545'
    };

    console.log(
      `%c${entry.timestamp} ${level.toUpperCase()}: ${message}`,
      colors[level]
    );
    if (meta) {
      console.log(meta);
    }
  }

  debug(message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog('debug')) {
      this.log('debug', message, meta);
    }
  }

  info(message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog('info')) {
      this.log('info', message, meta);
    }
  }

  warn(message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog('warn')) {
      this.log('warn', message, meta);
    }
  }

  error(message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog('error')) {
      this.log('error', message, meta);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app_logs');
    }
  }
}

// Create a singleton instance
const logger = new Logger(process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel || 'debug');

export default logger;