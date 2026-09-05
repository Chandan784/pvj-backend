const bookingService = require("../services/bookingServices");

const bookingController = {
  async createBooking(req, res) {
    try {
      const booking =
        await bookingService.createBooking(req.body);

      return res.status(201).json({
        success: true,
        message: "Booking created successfully",
        data: booking,
      });
    } catch (error) {
      console.error(error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getBookings(req, res) {
    try {
      const result =
        await bookingService.getBookings(req.query);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getBookingById(req, res) {
    try {
      const booking =
        await bookingService.getBookingById(
          req.params.id
        );

      return res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  },

  async updateBooking(req, res) {
    try {
      const booking =
        await bookingService.updateBooking(
          req.params.id,
          req.body
        );

      return res.status(200).json({
        success: true,
        message: "Booking updated successfully",
        data: booking,
      });
    } catch (error) {
      console.error(error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  async deleteBooking(req, res) {
    try {
      const result =
        await bookingService.deleteBooking(
          req.params.id
        );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = bookingController;