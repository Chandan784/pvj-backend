const errorMiddleware = (
  error,
  req,
  res,
  next
) => {

  console.error(error);

  res.status(500).json({
    success: false,
    message:
      error.message ||
      "Internal server error",
  });
};

module.exports = errorMiddleware;