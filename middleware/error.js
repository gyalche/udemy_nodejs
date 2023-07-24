class ErrorHandler extends Error {
  constructor(message, errorStatus) {
    super(errorStatus);
    this.message = message;
  }
}
export const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || 'internal server error';
  return res.status(404).json({
    success: false,
    error: err.message,
  });
};

export default ErrorHandler();
