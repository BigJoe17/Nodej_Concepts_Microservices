const logger = require('../utils/logger');
const { validateRegistration , validateLogin} = require('../utils/validation');
const generateTokens = require('../utils/generateToken');
const User = require('../models/User');

// User Registration
const registerUser = async (req, res) => {
    logger.info('Registration endpoint hit...');
    try {
        // Validate the Schema
        const { error } = validateRegistration(req.body);
        if (error) {
            logger.warn(`Validation Error: ${error.details[0].message}`);
            return res.status(400).json({ message: error.details[0].message, success: false });
        }

        const { username, email, password, role } = req.body;

        // Check if the user already exists
        let user = await User.findOne({ $or: [{ username }, { email }] });

        if (user) {
            logger.warn('User already exists');
            return res.status(400).json({
                message: 'User already exists',
                success: false
            });
        }

        // Create a new user
        user = new User({ username, email, password, role });
        await user.save();
        logger.info('User registered successfully');

       

        // Generate JWT Tokens
        const { accessToken, refreshToken } = await generateTokens(user);

        return res.status(201).json({
            message: 'User registered successfully',
            success: true,
            accessToken,
            refreshToken
        });

    } catch (e) {
        logger.error(`Error: ${e.message}`);
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }

};
    // log in User
 
    const loginUser = async (req, res) =>{
        logger.info('Login endpoint hit...');
        try{
            const {error} = validateLogin(req.body);
            logger.warn('User already exists');
            return res.status(400).json({
                message: 'User already exists',
                success: false
            });

            const {email, password} = req.body;
            const user = await User.findOne({email});
            if(!user){
                logger.warn('User not found');
                return res.status(400).json({message: 'User not found', success: false});
            }

            // Check if the password is correct
            const isValid = await user.comparePassword(password);
            if(!isValid){
                logger.warn('User not found');
                return res.status(400).json({message: 'invalid Password', success: false});
            }

        }catch(e){
            logger.error(`Error: ${e.message}`);
            return res.status(500).json({ message: 'Internal Server Error', success
        })
    }
}

module.exports = { registerUser, loginUser };
