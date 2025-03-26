const logger = require('../utils/logger');
const { validateRegistration, validateLogin } = require('../utils/validation');
const generateTokens = require('../utils/generateToken');
const User = require('../models/User');
const RefreshToken = require('../models/refreshToken');

// Helper function to validate refresh token
const validateRefreshToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error('Refresh Token not provided');
    }
    const storedtoken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedtoken) {
        throw new Error('Invalid Refresh Token');
    }
    if (storedtoken.expiresAt < new Date()) {
        throw new Error('Expired Refresh Token');
    }
    return storedtoken;
};

// User Registration
const registerUser = async (req, res) => {
    logger.info('Registration endpoint hit...');
    try {
        const { error } = validateRegistration(req.body);
        if (error) {
            logger.warn(`Validation Error: ${error.details[0].message}`);
            return res.status(400).json({ message: error.details[0].message, success: false });
        }

        const { username, email, password, role } = req.body;

        let user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            logger.warn('User already exists');
            return res.status(400).json({ message: 'User already exists', success: false });
        }

        user = new User({ username, email, password, role });
        await user.save();
        logger.info('User registered successfully');

        const { accessToken, refreshToken } = await generateTokens(user);

        return res.status(201).json({
            message: 'User registered successfully',
            success: true,
            accessToken,
            refreshToken,
        });
    } catch (e) {
        logger.error(`Error in registerUser: ${e.message}`);
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

// Login User
const loginUser = async (req, res) => {
    logger.info('Login endpoint hit...');
    try {
        const { error } = validateLogin(req.body);
        if (error) {
            logger.warn(`Validation Error: ${error.details[0].message}`);
            return res.status(400).json({ message: error.details[0].message, success: false });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            logger.warn('User not found');
            return res.status(400).json({ message: 'User not found', success: false });
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
            logger.warn('Invalid Password');
            return res.status(400).json({ message: 'Invalid Password', success: false });
        }

        const { accessToken, refreshToken } = await generateTokens(user);

        return res.json({
            message: 'Login successful',
            success: true,
            accessToken,
            refreshToken,
            userId: user._id,
        });
    } catch (e) {
        logger.error(`Error in loginUser: ${e.message}`);
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

// Refresh Token
const refreshTokenUser = async (req, res) => {
    logger.info('Refresh Token endpoint hit...');
    try {
        const { refreshToken } = req.body;
        const storedtoken = await validateRefreshToken(refreshToken);

        const user = await User.findById(storedtoken.user);
        if (!user) {
            logger.warn('User not found');
            return res.status(401).json({ message: 'User not found', success: false });
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokens(user);

        await RefreshToken.deleteOne({ _id: storedtoken._id });
        res.json({
            message: 'Token Refreshed',
            success: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            userId: user._id,
        });
    } catch (e) {
        logger.error(`Error in refreshTokenUser: ${e.message}`);
        return res.status(500).json({ message: e.message || 'Internal Server Error', success: false });
    }
};

// Logout User
const logoutUser = async (req, res) => {
    logger.info('Logout endpoint hit...');
    try {
        const { refreshToken } = req.body;
        const storedtoken = await validateRefreshToken(refreshToken);

        await RefreshToken.deleteOne({ _id: storedtoken._id });
        res.json({ message: 'User logged out', success: true });
    } catch (e) {
        logger.error(`Error in logoutUser: ${e.message}`);
        return res.status(500).json({ message: e.message || 'Internal Server Error', success: false });
    }
};

module.exports = { registerUser, loginUser, refreshTokenUser, logoutUser };