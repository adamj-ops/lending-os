type Level = 'debug' | 'info' | 'warn' | 'error';

const env = process.env.NODE_ENV || 'development';
const isDev = env !== 'production';

function log(level: Level, ...args: unknown[]) {
  const prefix = `[${new Date().toISOString()}] [${level.toUpperCase()}]`;
  // eslint-disable-next-line no-console
  (console as any)[level === 'debug' ? 'log' : level](prefix, ...args);
}

export const logger = {
  debug: (...args: unknown[]) => isDev && log('debug', ...args),
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
};

