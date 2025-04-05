const logger = require('../utils/loggers');

const authenticateRequest = async (req, res, next) => {
          const userId = req.headers['x-user-id'];
          if(!userId){
              logger.warn('Accept attempted While User ID not provided');
              return res.status(401).json({ message: 'Unauthorized', success: false });
          }

            req.user = { _id: userId };
            next();
}

module.exports = { authenticateRequest };      