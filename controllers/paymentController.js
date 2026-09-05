const paymentService = require("../services/paymentService");

class PaymentController {
  async create(req, res) {
    try {
      const payment = await paymentService.createPayment(
        req.body
      );

      return res.status(201).json({
        success: true,
        message: "Payment created successfully",
        data: payment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAll(req, res) {
    try {
      const payments = await paymentService.getPayments(
        req.query
      );

      return res.status(200).json({
        success: true,
        count: payments.length,
        data: payments,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const payment = await paymentService.getPayment(
        req.params.id
      );

      return res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getByBooking(req, res) {
    try {
      const payments =
        await paymentService.getBookingPayments(
          req.params.bookingId
        );

      return res.status(200).json({
        success: true,
        count: payments.length,
        data: payments,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const payment = await paymentService.updatePayment(
        req.params.id,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: "Payment updated successfully",
        data: payment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateStatus(req, res) {
    try {
      const payment =
        await paymentService.updateStatus(
          req.params.id,
          req.body.status
        );

      return res.status(200).json({
        success: true,
        message: "Payment status updated successfully",
        data: payment,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async summary(req, res) {
    try {
      const summary =
        await paymentService.getSummary();

      return res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new PaymentController();