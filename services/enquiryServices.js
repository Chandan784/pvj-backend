
const enquiryRepository = require("../repository/enquiryRepository");

class EnquiryServices {
  // --------------------------------
  // GET ALL ENQUIRIES
  // --------------------------------

  async getEnquiries(filters) {
    return await enquiryRepository.findAll(filters);
  }

  // --------------------------------
  // GET ENQUIRY BY ID
  // --------------------------------

  async getEnquiryById(id) {
    const enquiry = await enquiryRepository.findById(id);

    if (!enquiry) {
      throw new Error("Enquiry not found");
    }

    return enquiry;
  }

  // --------------------------------
  // CREATE ENQUIRY
  // --------------------------------

  async createEnquiry(data) {
    if (!data.name) {
      throw new Error("Customer name is required");
    }

    if (!data.phone) {
      throw new Error("Phone number is required");
    }

    if (!data.destination) {
      throw new Error("Destination is required");
    }

    if (!data.travelDate) {
      throw new Error("Travel date is required");
    }

    // Validate lead status
    const validStatuses = [
      "NEW",
      "CONTACTED",
      "QUALIFIED",
      "FOLLOW_UP",
      "CONVERTED",
      "LOST",
    ];

    if (
      data.status &&
      !validStatuses.includes(data.status)
    ) {
      throw new Error("Invalid enquiry status");
    }

    // Validate quotation status
    const validQuotationStatuses = [
      "NONE",
      "DRAFT",
      "SENT",
      "VIEWED",
      "ACCEPTED",
      "REJECTED",
    ];

    if (
      data.quotationStatus &&
      !validQuotationStatuses.includes(
        data.quotationStatus
      )
    ) {
      throw new Error("Invalid quotation status");
    }

    return await enquiryRepository.create(data);
  }

  // --------------------------------
  // UPDATE COMPLETE ENQUIRY
  // --------------------------------

  async updateEnquiry(id, data) {
    const existing =
      await enquiryRepository.findById(id);

    if (!existing) {
      throw new Error("Enquiry not found");
    }

    // Validate lead status
    const validStatuses = [
      "NEW",
      "CONTACTED",
      "QUALIFIED",
      "FOLLOW_UP",
      "CONVERTED",
      "LOST",
    ];

    if (
      data.status &&
      !validStatuses.includes(data.status)
    ) {
      throw new Error("Invalid enquiry status");
    }

    // Validate quotation status
    const validQuotationStatuses = [
      "NONE",
      "DRAFT",
      "SENT",
      "VIEWED",
      "ACCEPTED",
      "REJECTED",
    ];

    if (
      data.quotationStatus &&
      !validQuotationStatuses.includes(
        data.quotationStatus
      )
    ) {
      throw new Error("Invalid quotation status");
    }

    return await enquiryRepository.update(
      id,
      data
    );
  }

  // --------------------------------
  // DELETE ENQUIRY
  // --------------------------------

  async deleteEnquiry(id) {
    const existing =
      await enquiryRepository.findById(id);

    if (!existing) {
      throw new Error("Enquiry not found");
    }

    return await enquiryRepository.delete(id);
  }
}

module.exports = new EnquiryServices();

