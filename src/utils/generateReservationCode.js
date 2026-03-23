const Reservation = require("../models/Reservation");

const generateReservationCode = async () => {
  let reservationCode;
  let exists = true;

  while (exists) {
    reservationCode = `ND-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    exists = await Reservation.exists({ reservationCode });
  }

  return reservationCode;
};

module.exports = generateReservationCode;
