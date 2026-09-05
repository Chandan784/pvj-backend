const authRepository = require("../repository/authRepository");

const {
    hashPassword,
    comparePassword,
} = require("../utils/password");

const {
    generateOtp,
    hashOtp,
    getOtpExpiry,
} = require("../utils/otp");

const {
    generateToken,
} = require("../utils/jwt");

const {
    sendOtpEmail,
} = require("./emailService");

// ======================================================
// CREATE ERROR
// ======================================================

function createError(message, status) {
    const error = new Error(message);
    error.status = status;
    return error;
}

// ======================================================
// NORMALIZE EMAIL
// ======================================================

function normalizeEmail(email) {
    return String(email || "")
        .trim()
        .toLowerCase();
}

// ======================================================
// SEND SIGNUP OTP
// ======================================================

async function sendSignupOtp(data) {
    const email = normalizeEmail(data.email);

    console.log("SIGNUP EMAIL:", email);

    if (!email) {
        throw createError("Email is required", 400);
    }

    const existingUser =
        await authRepository.findUserByEmail(email);

    if (existingUser) {
        throw createError(
            "Email is already registered",
            409
        );
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = getOtpExpiry();

    await authRepository.createOtp(
        email,
        otpHash,
        "SIGNUP",
        expiresAt
    );

    await sendOtpEmail(
        email,
        otp,
        "SIGNUP"
    );

    return {
        success: true,
        message: "OTP sent successfully",
    };
}

// ======================================================
// VERIFY SIGNUP OTP
// ======================================================

async function verifySignupOtp(data) {
    const email = normalizeEmail(data.email);
    const otp = String(data.otp || "").trim();

    if (!email || !otp) {
        throw createError(
            "Email and OTP are required",
            400
        );
    }

    if (!/^\d{6}$/.test(otp)) {
        throw createError(
            "OTP must contain 6 digits",
            400
        );
    }

    const otpRecord =
        await authRepository.findValidOtp(
            email,
            "SIGNUP"
        );

    if (!otpRecord) {
        throw createError(
            "OTP expired or invalid",
            400
        );
    }

    if (otpRecord.attempts >= 5) {
        throw createError(
            "Too many OTP attempts",
            429
        );
    }

    const incomingHash = hashOtp(otp);

    if (
        incomingHash !== otpRecord.otp_hash
    ) {
        await authRepository.incrementOtpAttempt(
            otpRecord.id
        );

        throw createError(
            "Invalid OTP",
            400
        );
    }

    let user =
        await authRepository.findUserByEmail(
            email
        );

    if (!user) {
        const userId =
            await authRepository.createUser(
                email
            );

        user = {
            id: userId,
            email: email,
            email_verified: true,
        };
    }

    await authRepository.markOtpVerified(
        otpRecord.id
    );

    return {
        success: true,
        message: "Email verified successfully",
        user: {
            id: user.id,
            email: user.email,
        },
    };
}

// ======================================================
// CREATE PASSWORD
// ======================================================

async function createPassword(data) {
    const email = normalizeEmail(data.email);
    const password = data.password || "";

    if (!email || !password) {
        throw createError(
            "Email and password are required",
            400
        );
    }

    if (password.length < 8) {
        throw createError(
            "Password must contain at least 8 characters",
            400
        );
    }

    const user =
        await authRepository.findUserByEmail(
            email
        );

    if (!user) {
        throw createError(
            "User not found",
            404
        );
    }

    if (!user.email_verified) {
        throw createError(
            "Email is not verified",
            403
        );
    }

    const passwordHash =
        await hashPassword(password);

    await authRepository.updatePassword(
        user.id,
        passwordHash
    );

    return {
        success: true,
        message: "Password created successfully",
    };
}

// ======================================================
// LOGIN
// ======================================================

async function login(data) {
    const email = normalizeEmail(data.email);
    const password = data.password || "";

    if (!email || !password) {
        throw createError(
            "Email and password are required",
            400
        );
    }

    const user =
        await authRepository.findUserByEmail(
            email
        );

    if (!user) {
        throw createError(
            "Invalid credentials",
            401
        );
    }

    if (!user.email_verified) {
        throw createError(
            "Please verify your email first",
            403
        );
    }

    if (!user.password_hash) {
        throw createError(
            "Password has not been created",
            400
        );
    }

    const passwordValid =
        await comparePassword(
            password,
            user.password_hash
        );

    if (!passwordValid) {
        throw createError(
            "Invalid credentials",
            401
        );
    }

    const token = generateToken(user);

    return {
        success: true,
        message: "Login successful",
        token,
        user: {
            id: user.id,
            email: user.email,
            type: user.type,
        },
    };
}

// ======================================================
// FORGOT PASSWORD
// ======================================================

async function forgotPassword(data) {
    const email = normalizeEmail(data.email);

    if (!email) {
        throw createError(
            "Email is required",
            400
        );
    }

    const user =
        await authRepository.findUserByEmail(
            email
        );

    if (!user) {
        return {
            success: true,
            message:
                "If the email exists, an OTP has been sent",
        };
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = getOtpExpiry();

    await authRepository.createOtp(
        email,
        otpHash,
        "PASSWORD_RESET",
        expiresAt
    );

    await sendOtpEmail(
        email,
        otp,
        "PASSWORD_RESET"
    );

    return {
        success: true,
        message:
            "If the email exists, an OTP has been sent",
    };
}

// ======================================================
// VERIFY RESET OTP
// ======================================================

async function verifyResetOtp(data) {
    const email = normalizeEmail(data.email);
    const otp = String(data.otp || "").trim();

    if (!email || !otp) {
        throw createError(
            "Email and OTP are required",
            400
        );
    }

    if (!/^\d{6}$/.test(otp)) {
        throw createError(
            "OTP must contain 6 digits",
            400
        );
    }

    const otpRecord =
        await authRepository.findValidOtp(
            email,
            "PASSWORD_RESET"
        );

    if (!otpRecord) {
        throw createError(
            "OTP expired or invalid",
            400
        );
    }

    if (otpRecord.attempts >= 5) {
        throw createError(
            "Too many OTP attempts",
            429
        );
    }

    const incomingHash = hashOtp(otp);

    if (
        incomingHash !== otpRecord.otp_hash
    ) {
        await authRepository.incrementOtpAttempt(
            otpRecord.id
        );

        throw createError(
            "Invalid OTP",
            400
        );
    }

    return {
        success: true,
        message: "OTP verified successfully",
    };
}

// ======================================================
// RESET PASSWORD
// ======================================================

async function resetPassword(data) {
    const email = normalizeEmail(data.email);
    const otp = String(data.otp || "").trim();
    const newPassword = data.newPassword || "";

    if (!email || !otp || !newPassword) {
        throw createError(
            "Email, OTP and new password are required",
            400
        );
    }

    if (!/^\d{6}$/.test(otp)) {
        throw createError(
            "OTP must contain 6 digits",
            400
        );
    }

    if (newPassword.length < 8) {
        throw createError(
            "Password must contain at least 8 characters",
            400
        );
    }

    const otpRecord =
        await authRepository.findValidOtp(
            email,
            "PASSWORD_RESET"
        );

    if (!otpRecord) {
        throw createError(
            "OTP expired or invalid",
            400
        );
    }

    if (otpRecord.attempts >= 5) {
        throw createError(
            "Too many OTP attempts",
            429
        );
    }

    const incomingHash = hashOtp(otp);

    if (
        incomingHash !== otpRecord.otp_hash
    ) {
        await authRepository.incrementOtpAttempt(
            otpRecord.id
        );

        throw createError(
            "Invalid OTP",
            400
        );
    }

    const user =
        await authRepository.findUserByEmail(
            email
        );

    if (!user) {
        throw createError(
            "Invalid request",
            400
        );
    }

    const passwordHash =
        await hashPassword(newPassword);

    await authRepository.updatePassword(
        user.id,
        passwordHash
    );

    await authRepository.markOtpVerified(
        otpRecord.id
    );

    return {
        success: true,
        message: "Password reset successful",
    };
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
    sendSignupOtp,
    verifySignupOtp,
    createPassword,
    verifyResetOtp,
    login,
    forgotPassword,
    resetPassword,
};
