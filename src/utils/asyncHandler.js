/**
 * Wrapper agar controller async tidak perlu try/catch berulang-ulang.
 * Error otomatis dilempar ke errorHandler middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
