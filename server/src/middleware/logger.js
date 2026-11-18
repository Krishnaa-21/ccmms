import morgan from 'morgan';

export const requestLogger = morgan(
  process.env.NODE_ENV === 'production'
    ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]'
    : 'dev'
);
