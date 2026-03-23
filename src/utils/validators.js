const isValidObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(value);

const requireFields = (payload, fields) => {
  const missingFields = fields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || value === "";
  });

  return missingFields;
};

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const validateDateRange = (checkInDate, checkOutDate) => {
  const startDate = parseDate(checkInDate);
  const endDate = parseDate(checkOutDate);

  if (!startDate || !endDate) {
    return { valid: false, message: "Invalid check-in or check-out date" };
  }

  if (startDate >= endDate) {
    return { valid: false, message: "Check-out date must be after check-in date" };
  }

  return { valid: true, startDate, endDate };
};

module.exports = {
  isValidObjectId,
  requireFields,
  parseDate,
  validateDateRange
};
