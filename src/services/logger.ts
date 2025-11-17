/**
 * Sistema de Logging Estruturado
 * 
 * Fornece logging estruturado com níveis, contexto e formatação consistente.
 * Os logs podem ser enviados para diferentes destinos (console, arquivo, backend).
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  screen?: string;
  action?: string;
}

class Logger {
  private enabled: boolean = true;
  private logLevel: LogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.INFO;
  private userId?: string;
  private context: Record<string, any> = {};

  /**
   * Configura o logger
   */
  configure(options: {
    enabled?: boolean;
    logLevel?: LogLevel;
    userId?: string;
  }): void {
    this.enabled = options.enabled ?? this.enabled;
    this.logLevel = options.logLevel ?? this.logLevel;
    this.userId = options.userId;
  }

  /**
   * Define contexto global
   */
  setContext(key: string, value: any): void {
    this.context[key] = value;
  }

  /**
   * Remove contexto global
   */
  removeContext(key: string): void {
    delete this.context[key];
  }

  /**
   * Limpa todo o contexto
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Define ID do usuário
   */
  setUserId(userId: string | undefined): void {
    this.userId = userId;
  }

  /**
   * Log genérico
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
  ): void {
    if (!this.enabled) return;

    // Verificar se deve logar baseado no nível
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    if (messageLevelIndex < currentLevelIndex) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.context, ...context },
      error,
      userId: this.userId,
    };

    // Formatar e exibir no console
    this.formatAndLog(entry);

    // Enviar para backend se necessário
    this.sendToBackend(entry);
  }

  /**
   * Formata e exibe log no console
   */
  private formatAndLog(entry: LogEntry): void {
    const { level, message, timestamp, context, error } = entry;
    const prefix = `[${level.toUpperCase()}] ${timestamp}`;
    const contextStr = context && Object.keys(context).length > 0 
      ? `\nContext: ${JSON.stringify(context, null, 2)}` 
      : '';

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${message}${contextStr}`);
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${message}${contextStr}`);
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${message}${contextStr}`);
        if (error) console.warn(error);
        break;
      case LogLevel.ERROR:
        console.error(`${prefix} ${message}${contextStr}`);
        if (error) console.error(error);
        break;
    }
  }

  /**
   * Envia log para backend (opcional)
   */
  private async sendToBackend(entry: LogEntry): Promise<void> {
    // Apenas enviar erros e warnings em produção
    if (__DEV__ || (entry.level !== LogLevel.ERROR && entry.level !== LogLevel.WARN)) {
      return;
    }

    try {
      // Implementar envio para backend se necessário
      // Por exemplo: await supabase.from('logs').insert(entry);
    } catch (error) {
      // Silenciosamente falhar - logging não deve quebrar a aplicação
      console.warn('[Logger] Erro ao enviar para backend:', error);
    }
  }

  /**
   * Debug log
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Info log
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Warning log
   */
  warn(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  /**
   * Error log
   */
  error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log de performance
   */
  performance(label: string, duration: number, context?: Record<string, any>): void {
    this.info(`Performance: ${label}`, {
      ...context,
      duration: `${duration}ms`,
    });
  }
}

// Instância singleton
export const logger = new Logger();

