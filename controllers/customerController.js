const customerService = require("../services/customerServices");

const customerController = {

  async create(req, res) {
    try {

      console.log("\n========== CUSTOMER CREATE ==========");
      console.log("Request Body:", req.body);

      const customer = await customerService.createCustomer(req.body);

      console.log("Created Customer:", customer);
      console.log("Customer ID:", customer.id);

      console.log("====================================\n");

      return res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: customer,
      });

    } catch (error) {

      console.error("\n========== CUSTOMER CREATE ERROR ==========");
      console.error("Message:", error.message);
      console.error("Name:", error.name);
      console.error("Code:", error.code);
      console.error("SQL State:", error.sqlState);
      console.error("Request Body:", req.body);
      console.error("Stack:", error.stack);
      console.error("===========================================\n");

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getAll(req, res) {
    try {

      const customers = await customerService.getCustomers();

      return res.status(200).json({
        success: true,
        data: customers,
      });

    } catch (error) {

      console.error("GET CUSTOMERS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getById(req, res) {
    try {

      const customer = await customerService.getCustomerById(
        req.params.id
      );

      return res.status(200).json({
        success: true,
        data: customer,
      });

    } catch (error) {

      console.error("GET CUSTOMER ERROR:", error);

      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  },

  async update(req, res) {
    try {

      const customer = await customerService.updateCustomer(
        req.params.id,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: "Customer updated successfully",
        data: customer,
      });

    } catch (error) {

      console.error("UPDATE CUSTOMER ERROR:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  async delete(req, res) {
    try {

      const result = await customerService.deleteCustomer(
        req.params.id
      );

      return res.status(200).json({
        success: true,
        ...result,
      });

    } catch (error) {

      console.error("DELETE CUSTOMER ERROR:", error);

      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = customerController;