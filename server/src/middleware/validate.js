import { ZodError } from 'zod';

/**
 * Validates request body, query, or params against a Zod schema.
 * Formats errors into { success: false, message, errors: [{ field, message }] }
 */
export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const dataToValidate = req[source] || {};
      const parsed = await schema.parseAsync(dataToValidate);
      req[source] = parsed; // replace with sanitized/parsed data
      next();
    } catch (error) {
      if (error instanceof ZodError || error.issues) {
        const issues = error.issues || error.errors || [];
        const formattedErrors = issues.map((err) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
          message: err.message
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors
        });
      }
      next(error);
    }
  };
};

export const validateBody = (schema) => validate(schema, 'body');
export const validateQuery = (schema) => validate(schema, 'query');
export const validateParams = (schema) => validate(schema, 'params');

export default {
  validate,
  validateBody,
  validateQuery,
  validateParams
};
