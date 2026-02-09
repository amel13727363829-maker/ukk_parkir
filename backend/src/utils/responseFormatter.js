// Standard API Response Formatter
const successResponse = (res, statusCode = 200, data = null, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, statusCode = 400, message = 'Error', errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

const paginatedResponse = (res, statusCode = 200, data = [], totalItems = 0, currentPage = 1, totalPages = 1, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      total: totalItems,
      page: currentPage,
      pages: totalPages,
      perPage: data.length,
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};
