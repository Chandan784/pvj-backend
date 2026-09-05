function generateCustomerId(id) {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const date = `${year}${month}${day}`;

  const sequence = String(id).padStart(6, "0");

  return `CUS-${date}-${sequence}`;
}

module.exports = generateCustomerId;