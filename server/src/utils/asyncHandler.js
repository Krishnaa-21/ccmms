/**
 * Async controller wrapper to catch unhandled rejections
 * and forward them cleanly to the Express error handler.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
