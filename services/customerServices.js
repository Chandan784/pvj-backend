const customerRepository = require("../repository/customerRepository");

const customerService = {

  async createCustomer(data) {

    const {
      name,
      email,
      phone,
      address,
    } = data;

    if (!name || !name.trim()) {
      throw new Error("Name is required");
    }

    if (!phone || !phone.trim()) {
      throw new Error("Phone is required");
    }

    const id = await customerRepository.create({
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone.trim(),
      address: address?.trim() || null,
    });

    console.log("Generated Customer ID:", id);

    const customer = await customerRepository.findById(id);

    if (!customer) {
      throw new Error(
        `Customer was created but could not be fetched. ID: ${id}`
      );
    }

    return customer;
  },

  async getCustomers() {
    return await customerRepository.findAll();
  },

  async getCustomerById(id) {

    if (!id) {
      throw new Error("Customer ID is required");
    }

    const customer = await customerRepository.findById(id);

    if (!customer) {
      throw new Error("Customer not found");
    }

    return customer;
  },

  async updateCustomer(id, data) {

    if (!id) {
      throw new Error("Customer ID is required");
    }

    const customer = await customerRepository.findById(id);

    if (!customer) {
      throw new Error("Customer not found");
    }

    if (!data.name || !data.name.trim()) {
      throw new Error("Name is required");
    }

    if (!data.phone || !data.phone.trim()) {
      throw new Error("Phone is required");
    }

    await customerRepository.update(id, {
      name: data.name.trim(),
      email: data.email?.trim() || null,
      phone: data.phone.trim(),
      address: data.address?.trim() || null,
    });

    return await customerRepository.findById(id);
  },

  async deleteCustomer(id) {

    if (!id) {
      throw new Error("Customer ID is required");
    }

    const customer = await customerRepository.findById(id);

    if (!customer) {
      throw new Error("Customer not found");
    }

    await customerRepository.delete(id);

    return {
      message: "Customer deleted successfully",
    };
  },
};

module.exports = customerService;