const paymentRepository = require("../repository/paymentRepository");

const ALLOWED_METHODS = [
  "UPI",
  "CARD",
  "BANK_TRANSFER",
  "CASH",
];

const ALLOWED_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

class PaymentService {
  async createPayment(data) {
    if (!data.booking_id) {
      throw new Error("Booking ID is required");
    }

    if (!data.customer_id) {
      throw new Error("Customer ID is required");
    }

    if (!data.amount || Number(data.amount) <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    if (!ALLOWED_METHODS.includes(data.payment_method)) {
      throw new Error("Invalid payment method");
    }

    const payment = {
      booking_id: data.booking_id,
      customer_id: data.customer_id,
      amount: Number(data.amount),
      payment_method: data.payment_method,
      transaction_id: data.transaction_id,
      status: "PENDING",
      payment_date: data.payment_date || new Date(),
      notes: data.notes,
    };

    return paymentRepository.create(payment);
  }

  async getPayments(filters) {
    return paymentRepository.findAll(filters);
  }

  async getPayment(id) {
    const payment = await paymentRepository.findById(id);

    if (!payment) {
      throw new Error("Payment not found");
    }

    return payment;
  }

  async getBookingPayments(bookingId) {
    return paymentRepository.findByBookingId(bookingId);
  }

  async updatePayment(id, data) {
    const existing = await paymentRepository.findById(id);

    if (!existing) {
      throw new Error("Payment not found");
    }

    if (existing.status === "REFUNDED") {
      throw new Error("Refunded payment cannot be edited");
    }

    if (!data.amount || Number(data.amount) <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    if (!ALLOWED_METHODS.includes(data.payment_method)) {
      throw new Error("Invalid payment method");
    }

    return paymentRepository.update(id, {
      amount: Number(data.amount),
      payment_method: data.payment_method,
      transaction_id: data.transaction_id,
      payment_date: data.payment_date,
      notes: data.notes,
    });
  }

  async updateStatus(id, status) {
    const existing = await paymentRepository.findById(id);

    if (!existing) {
      throw new Error("Payment not found");
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      throw new Error("Invalid payment status");
    }

    // Basic MVP status rules
    if (existing.status === "REFUNDED") {
      throw new Error("Refunded payment cannot be changed");
    }

    if (
      existing.status === "PAID" &&
      status === "PENDING"
    ) {
      throw new Error(
        "Paid payment cannot be changed back to pending"
      );
    }

    if (
      existing.status === "FAILED" &&
      status === "REFUNDED"
    ) {
      throw new Error(
        "Failed payment cannot be refunded"
      );
    }

    return paymentRepository.updateStatus(id, status);
  }

  async getSummary() {
    return paymentRepository.getSummary();
  }
}

module.exports = new PaymentService();