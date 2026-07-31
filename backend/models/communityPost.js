const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
    trim: true
  },
  authorEmail: {
    type: String,
    required: true,
    trim: true
  },
  authorAvatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String
  }],
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: String // Array of authorEmail strings
  }],
  commentCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CommunityPost', communityPostSchema);
