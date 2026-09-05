const bookingRepository = require("../repository/bookingRepository");

const bookingService = {
  async createBooking(data) {
    const totalAmount = Number(data.totalAmount || 0);
    const paidAmount = Number(data.paidAmount || 0);

    if (paidAmount > totalAmount) {
      throw new Error(
        "Paid amount cannot be greater than total amount"
      );
    }

    let paymentStatus = "UNPAID";

    if (paidAmount === totalAmount && totalAmount > 0) {
      paymentStatus = "PAID";
    } else if (paidAmount > 0) {
      paymentStatus = "PARTIAL";
    }

    const bookingId = await this.generateBookingId();

    const bookingData = {
      bookingId,
      customerId: data.customerId,
      packageId: data.packageId,
      destinationId: data.destinationId,

      travelStartDate: data.travelStartDate,
      travelEndDate: data.travelEndDate,

      travelerCount: data.travelerCount || 1,

      totalAmount,
      paidAmount,

      paymentStatus,

      status: data.status || "PENDING",

      bookingSource:
        data.bookingSource || "WEBSITE",
    };

    const id = await bookingRepository.create(
      bookingData
    );

    return bookingRepository.findById(id);
  },

  async getBookings(query) {
    const page = Math.max(
      Number(query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(query.limit) || 10, 1),
      100
    );

    const result = await bookingRepository.findAll({
      page,
      limit,
      search: query.search || "",
      status: query.status || "",
      paymentStatus: query.paymentStatus || "",
    });

    return {
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(
          result.total / limit
        ),
      },
    };
  },

  async getBookingById(id) {
    const booking =
      await bookingRepository.findById(id);

    if (!booking) {
      throw new Error("Booking not found");
    }

    return booking;
  },

  async updateBooking(id, data) {
    const existing =
      await bookingRepository.findById(id);

    if (!existing) {
      throw new Error("Booking not found");
    }

    const totalAmount =
      Number(data.totalAmount);

    const paidAmount =
      Number(data.paidAmount);

    if (paidAmount > totalAmount) {
      throw new Error(
        "Paid amount cannot be greater than total amount"
      );
    }

    let paymentStatus = "UNPAID";

    if (
      paidAmount === totalAmount &&
      totalAmount > 0
    ) {
      paymentStatus = "PAID";
    } else if (paidAmount > 0) {
      paymentStatus = "PARTIAL";
    }

    const bookingData = {
      customerId: data.customerId,
      packageId: data.packageId,
      destinationId: data.destinationId,

      travelStartDate: data.travelStartDate,
      travelEndDate: data.travelEndDate,

      travelerCount: data.travelerCount,

      totalAmount,
      paidAmount,

      paymentStatus,

      status: data.status,
      bookingSource: data.bookingSource,
    };

    await bookingRepository.update(
      id,
      bookingData
    );

    return bookingRepository.findById(id);
  },

  async deleteBooking(id) {
    const booking =
      await bookingRepository.findById(id);

    if (!booking) {
      throw new Error("Booking not found");
    }

    await bookingRepository.softDelete(id);

    return {
      message: "Booking deleted successfully",
    };
  },

  async generateBookingId() {
    const now = new Date();

    const year = now.getFullYear();

    const timestamp =
      Date.now().toString().slice(-6);

    return `BK-${year}-${timestamp}`;
  },
};

module.exports = bookingService;