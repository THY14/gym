const logger = {
  info: (data) => console.log(`[${new Date().toISOString()}] INFO: ${JSON.stringify(data)}`),
  error: (data) => console.error(`[${new Date().toISOString()}] ERROR: ${JSON.stringify(data)}`),
};

const logError = ({ message, stack, path, method, user }) => {
  logger.error({
    message,
    stack,
    path,
    method,
    user: user || 'unauthenticated',
  });
};

const logInfo = ({ message, path, method, user }) => {
  logger.info({
    message,
    path,
    method,
    user: user || 'unauthenticated',
  });
};

export { logError, logInfo };