const crypto = require("crypto");

function generateOtp() {
    return crypto.randomInt(100000, 1000000).toString();
}

function hashOtp(otp) {
    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
}

function getOtpExpiry() {
    const expiry = new Date();

    expiry.setMinutes(
        expiry.getMinutes() + 5
    );

    return expiry;
}

module.exports = {
    generateOtp,
    hashOtp,
    getOtpExpiry
};