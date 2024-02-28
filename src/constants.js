export const BookingStatus = {
  Accepted: "ACCEPTED",
  Rejected: "REJECTED",
  Pending: "PENDING",
};

export const UserRoles = {
  admin: "admin",
  carOwner: "car owner",
  carRental: "car rental",
};
export const mapValidationErrors = (validationResult) => {
  const errors = validationResult.error.errors.reduce((acc, error) => {
    acc[error.path[0]] = error.message;
    return acc;
  }, {});
  return errors;
};
