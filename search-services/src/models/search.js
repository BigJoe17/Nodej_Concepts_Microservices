const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },

    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

searchSchema.index({ content: 'text' });
searchSchema.index({ createdAt: -1 });
const Search = mongoose.model('Search', searchSchema);
module.exports = Search;
// const Search = mongoose.model('Search', searchSchema);