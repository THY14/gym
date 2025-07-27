const sendSuccessResponse = (res, status, data, message = 'Success') => {
  res.status(status).json({
    error: false,
    message,
    data,
  });
};

const sendErrorResponse = (res, status, message) => {
  res.status(status).json({
    error: true,
    message,
  });
};

export { sendSuccessResponse, sendErrorResponse };