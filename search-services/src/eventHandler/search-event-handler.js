const logger = require("../utils/loggers");
const SearchPost = require("../models/search"); // Import the Mongoose model

const handlePostCreated = async (event) => {
    try {
        console.log(event, "eventeventevent");

        // Create a new document using the Mongoose model
        const newSearchPost = new SearchPost({
            postId: event.postId,
            content: event.content,
            userId: event.userId,
            createdAt: event.createdAt,
        });

        // Save the document to the database
        await newSearchPost.save();

        console.log("newSearchPost", newSearchPost);

        logger.info(
            `Post created successfully in search service. Post ID: ${event.postId}, SearchPost ID: ${newSearchPost._id}`
        );
    } catch (error) {
        logger.error(`Error handling post.created event: ${error.message}`);
    }
};

async function handlePostDeleted(event) {
  

    await SearchPost.findOneAndDelete({ postId: event.postId })
        .then(() => {
            console.log("Post deleted successfully from search service.");
            logger.info(
                `Post deleted successfully from search service. Post ID: ${event.postId}`
            );
        })
        .catch((error) => {
            console.error("Error deleting post:", error);
        });
}


module.exports = { handlePostCreated, handlePostDeleted };