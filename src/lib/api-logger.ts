import { logger } from './logger';

type Handler<TContext = any> = (req: Request, context?: TContext) => Promise<Response>;

export function withRequestLogging<TContext = any>(handler: Handler<TContext>): Handler<TContext> {
  return async (req, context) => {
    const start = Date.now();
    const { method } = req as any;
    const path = (() => {
      try {
        return new URL(req.url).pathname;
      } catch {
        return 'unknown';
      }
    })();

    try {
      const res = await handler(req, context);
      const duration = Date.now() - start;
      logger.info(`${method} ${path} -> ${res.status} ${duration}ms`);
      return res;
    } catch (error: any) {
      const duration = Date.now() - start;
      logger.error(`${method} ${path} -> ERROR ${duration}ms`, error?.message || error);
      throw error;
    }
  };
}

