const db = require("../config/db");


// ======================================================
// AUTH REPOSITORY
// ======================================================

const authRepository = {

    // ==================================================
    // FIND USER BY EMAIL
    // ==================================================

    async findUserByEmail(email) {

        const sql = `
            SELECT
                id,
                email,
                password_hash,
                type,
                email_verified,
                created_at,
                updated_at
            FROM users
            WHERE email = ?
            LIMIT 1
        `;

        const [rows] =
            await db.query(
                sql,
                [email]
            );

        return rows[0] || null;
    },


    // ==================================================
    // FIND USER BY ID
    // ==================================================

    async findUserById(id) {

        const sql = `
            SELECT
                id,
                email,
                password_hash,
                type,
                email_verified,
                created_at,
                updated_at
            FROM users
            WHERE id = ?
            LIMIT 1
        `;

        const [rows] =
            await db.query(
                sql,
                [id]
            );

        return rows[0] || null;
    },


    // ==================================================
    // CREATE USER
    // ==================================================

    async createUser(email) {

        const sql = `
            INSERT INTO users (
                email,
                email_verified
            )
            VALUES (?, TRUE)
        `;

        const [result] =
            await db.query(
                sql,
                [email]
            );

        return result.insertId;
    },


    // ==================================================
    // UPDATE PASSWORD
    // ==================================================

    async updatePassword(
        userId,
        passwordHash
    ) {

        const sql = `
            UPDATE users
            SET password_hash = ?
            WHERE id = ?
        `;

        await db.query(
            sql,
            [
                passwordHash,
                userId
            ]
        );
    },


    // ==================================================
    // VERIFY EMAIL
    // ==================================================

    async verifyEmail(userId) {

        const sql = `
            UPDATE users
            SET email_verified = TRUE
            WHERE id = ?
        `;

        await db.query(
            sql,
            [userId]
        );
    },


    // ==================================================
    // CREATE OTP
    // ==================================================

    async createOtp(
        email,
        otpHash,
        purpose,
        expiresAt
    ) {

        // ----------------------------------------------
        // Invalidate previous OTP
        // ----------------------------------------------

        const invalidateSql = `
            UPDATE otp_verifications
            SET verified_at = NOW()
            WHERE email = ?
            AND purpose = ?
            AND verified_at IS NULL
        `;

        await db.query(
            invalidateSql,
            [
                email,
                purpose
            ]
        );


        // ----------------------------------------------
        // Create new OTP
        // ----------------------------------------------

        const sql = `
            INSERT INTO otp_verifications (
                email,
                otp_hash,
                purpose,
                attempts,
                expires_at
            )
            VALUES (?, ?, ?, 0, ?)
        `;

        const [result] =
            await db.query(
                sql,
                [
                    email,
                    otpHash,
                    purpose,
                    expiresAt
                ]
            );

        return result.insertId;
    },


    // ==================================================
    // FIND VALID OTP
    // ==================================================

    async findValidOtp(
        email,
        purpose
    ) {

        const sql = `
            SELECT
                id,
                email,
                otp_hash,
                purpose,
                attempts,
                expires_at,
                verified_at,
                created_at
            FROM otp_verifications
            WHERE email = ?
            AND purpose = ?
            AND verified_at IS NULL
            AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1
        `;

        const [rows] =
            await db.query(
                sql,
                [
                    email,
                    purpose
                ]
            );

        return rows[0] || null;
    },


    // ==================================================
    // INCREMENT OTP ATTEMPT
    // ==================================================

    async incrementOtpAttempt(id) {

        const sql = `
            UPDATE otp_verifications
            SET attempts = attempts + 1
            WHERE id = ?
        `;

        await db.query(
            sql,
            [id]
        );
    },


    // ==================================================
    // MARK OTP VERIFIED
    // ==================================================

    async markOtpVerified(id) {

        const sql = `
            UPDATE otp_verifications
            SET verified_at = NOW()
            WHERE id = ?
        `;

        await db.query(
            sql,
            [id]
        );
    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports = authRepository;