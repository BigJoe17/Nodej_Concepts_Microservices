const search = require("../models/search");
const logger = require("../utils/loggers");



const searchPostController = async (req, res)=>{

    logger.info("search post endpoint hit");
    try {
        const {query } = req.query;
        const result = await search.find({
            $text: {$search: query},
           
        }, {
            score: { $meta: "textScore" }
        }

    )
    .sort({
        score: { $meta: "textScore" }
    }).limit(10);

    res.json({result, success: true});

}
      
    catch (e) {
        logger.logger.error(e.message);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
    logger.info("search post successfully");

}
module.exports = {
    searchPostController,
};

