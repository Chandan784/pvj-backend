const enquiryServices = require("../services/enquiryServices");

class EnquiryController {
  // GET /api/enquiries
  async getAll(req, res, next) {
    try {
      const { search, status } = req.query;

      const enquiries =
        await enquiryServices.getEnquiries({
          search,
          status,
        });

      res.status(200).json({
        success: true,
        data: enquiries,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/enquiries/:id
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const enquiry =
        await enquiryServices.getEnquiryById(id);

      res.status(200).json({
        success: true,
        data: enquiry,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/enquiries
  async create(req, res, next) {
    try {
      const enquiry =
        await enquiryServices.createEnquiry(
          req.body
        );

      res.status(201).json({
        success: true,
        message: "Enquiry created successfully",
        data: enquiry,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/enquiries/:id
  // Updates customer + travel + status + quotation
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const enquiry =
        await enquiryServices.updateEnquiry(
          id,
          req.body
        );

      res.status(200).json({
        success: true,
        message: "Enquiry updated successfully",
        data: enquiry,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/enquiries/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      await enquiryServices.deleteEnquiry(id);

      res.status(200).json({
        success: true,
        message: "Enquiry deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EnquiryController();