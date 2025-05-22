/**
 * Helper functions for creating standardized API responses.
 */

/**
 * Creates a standardized success response object.
 * @param {string} message - A human-readable success message.
 * @param {any} [data=null] - The data payload for the success response.
 * @returns {{ status: 'success', message: string, data: any }} The standardized success response object.
 */
function successResponse(message, data = null) {
  return {
    status: 'success',
    message,
    data,
  };
}

/**
 * Creates a standardized error response object.
 * @param {string} message - A human-readable error message.
 * @param {any} [errorDetails=null] - Details about the error.
 * @returns {{ status: 'error', message: string, error: any }} The standardized error response object.
 */
function errorResponse(message, errorDetails = null) {
  return {
    status: 'error',
    message,
    error: errorDetails,
  };
}

module.exports = {
  successResponse,
  errorResponse,
};