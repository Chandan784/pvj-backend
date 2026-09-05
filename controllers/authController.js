const authService = require("../services/authServices");

async function sendSignupOtp(req, res) {
    try {
        const response =
            await authService.sendSignupOtp(req.body);

        return res.status(200).json(response);

    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message,
        });
    }
}


async function verifySignupOtp(req, res) {
    try {
        const response =
            await authService.verifySignupOtp(req.body);

        return res.status(200).json(response);

    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message,
        });
    }
}


async function createPassword(req, res) {
    try {
        const response =
            await authService.createPassword(req.body);

        return res.status(200).json(response);

    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message,
        });
    }
}


async function login(req, res) {
    try {
        const result =
            await authService.login(req.body);

        return res.status(200).json(result);

    } catch (error) {
        console.error(
            "LOGIN ERROR:",
            error
        );

        return res.status(
            error.status || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Login failed",
        });
    }
}


async function forgotPassword(req, res) {
    try {
        const response =
            await authService.forgotPassword(req.body);

        return res.status(200).json(response);

    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message,
        });
    }
}

async function resetPassword(req, res) {
    try {
        const result =
            await authService.resetPassword(
                req.body
            );

        return res.status(200).json(result);

    } catch (error) {
        console.error(
            "RESET PASSWORD ERROR:",
            error
        );

        return res.status(
            error.status || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Internal server error",
        });
    }
}
async function verifyResetOtp(req, res) {
    try {
        const result =
            await authService.verifyResetOtp(
                req.body
            );

        return res.status(200).json(result);

    } catch (error) {
        console.error(
            "VERIFY RESET OTP ERROR:",
            error
        );

        return res.status(
            error.status || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Internal server error",
        });
    }
}




module.exports = {
    sendSignupOtp,
    verifySignupOtp,
    verifyResetOtp,
    createPassword,
    login,
    forgotPassword,
    resetPassword,
};