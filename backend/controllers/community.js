const CommunityPost = require('../models/communityPost');
const Comment = require('../models/comment');

// Seed sample community posts if empty
const seedPostsIfEmpty = async () => {
  try {
    const count = await CommunityPost.countDocuments();
    if (count === 0) {
      const dummyPosts = [
        {
          author: 'Aarav Sharma',
          authorEmail: 'aarav@example.com',
          authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          title: 'Scenic Morning Ride from Delhi to Jaipur!',
          content: 'Took the early morning A/C Sleeper bus with TedBus. The highway view near Neemrana was breathtaking! Driver was punctual and seat comfort was 10/10.',
          images: [
            'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80'
          ],
          likes: 12,
          likedBy: [],
          commentCount: 2
        },
        {
          author: 'Priya Patel',
          authorEmail: 'priya@example.com',
          authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
          title: 'Smooth Travel Experience: Mumbai to Goa',
          content: 'Traveled overnight for a weekend trip. The live tracking feature kept my family updated on my exact location the whole time. Super clean bus and great rest stops.',
          images: [
            'https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?auto=format&fit=crop&w=800&q=80'
          ],
          likes: 8,
          likedBy: [],
          commentCount: 1
        },
        {
          author: 'Rohan Mehta',
          authorEmail: 'rohan@example.com',
          authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
          title: 'Bangalore to Mysore Expressway Review',
          content: 'The new expressway reduced travel time to just 2 hours! Highly recommend booking via TedBus for discount offers.',
          images: [],
          likes: 5,
          likedBy: [],
          commentCount: 0
        }
      ];

      const inserted = await CommunityPost.insertMany(dummyPosts);

      // Seed initial dummy comments for post 0
      if (inserted.length > 0) {
        await Comment.create([
          {
            postId: inserted[0]._id,
            author: 'Ananya Roy',
            authorEmail: 'ananya@example.com',
            authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            message: 'Awesome pictures! Did the bus stop at Neemrana Midway?'
          },
          {
            postId: inserted[0]._id,
            author: 'Aarav Sharma',
            authorEmail: 'aarav@example.com',
            authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            message: 'Yes! Had a 25-min tea break there.'
          },
          {
            postId: inserted[1]._id,
            author: 'Vikram Singh',
            authorEmail: 'vikram@example.com',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            message: 'Live tracking really gives peace of mind!'
          }
        ]);
      }
    }
  } catch (error) {
    console.error('Error seeding community posts:', error);
  }
};

// GET /community/posts
exports.getPosts = async (req, res) => {
  try {
    await seedPostsIfEmpty();

    const { search, sort } = req.query;
    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { author: searchRegex }
        ]
      };
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'mostLiked') {
      sortOptions = { likes: -1, createdAt: -1 };
    } else if (sort === 'mostCommented') {
      sortOptions = { commentCount: -1, createdAt: -1 };
    }

    const posts = await CommunityPost.find(query).sort(sortOptions).exec();
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error getting community posts:', error);
    res.status(500).json({ error: 'Failed to fetch community posts' });
  }
};

// GET /community/posts/:id
exports.getPostById = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error('Error getting post by ID:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

// POST /community/posts
exports.createPost = async (req, res) => {
  try {
    const userEmail = req.customer.email;
    const userName = req.customer.name || userEmail.split('@')[0];
    const userAvatar = req.body.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

    const { title, content, images } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and story content are required' });
    }

    const newPost = new CommunityPost({
      author: userName,
      authorEmail: userEmail,
      authorAvatar: userAvatar,
      title,
      content,
      images: Array.isArray(images) ? images : (images ? [images] : []),
      likes: 0,
      likedBy: [],
      commentCount: 0
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

// PUT /community/posts/:id
exports.updatePost = async (req, res) => {
  try {
    const userEmail = req.customer.email;
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorEmail !== userEmail) {
      return res.status(403).json({ error: 'Unauthorized to edit this post' });
    }

    const { title, content, images } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (images !== undefined) post.images = Array.isArray(images) ? images : [images];

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
};

// DELETE /community/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const userEmail = req.customer.email;
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorEmail !== userEmail) {
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }

    await CommunityPost.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ postId: req.params.id });

    res.status(200).json({ message: 'Post and comments deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

// POST /community/posts/:id/like
exports.likePost = async (req, res) => {
  try {
    const userEmail = req.customer.email;
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const alreadyLikedIndex = post.likedBy.indexOf(userEmail);
    if (alreadyLikedIndex > -1) {
      // Unlike
      post.likedBy.splice(alreadyLikedIndex, 1);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like
      post.likedBy.push(userEmail);
      post.likes += 1;
    }

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to like/unlike post' });
  }
};

// GET /community/posts/:id/comments
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id }).sort({ createdAt: 1 }).exec();
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// POST /community/posts/:id/comments
exports.createComment = async (req, res) => {
  try {
    const userEmail = req.customer.email;
    const userName = req.customer.name || userEmail.split('@')[0];
    const userAvatar = req.body.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Comment message is required' });
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = new Comment({
      postId: req.params.id,
      author: userName,
      authorEmail: userEmail,
      authorAvatar: userAvatar,
      message
    });

    const savedComment = await newComment.save();

    // Increment commentCount on post
    post.commentCount += 1;
    await post.save();

    res.status(201).json(savedComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

// DELETE /community/comments/:id
exports.deleteComment = async (req, res) => {
  try {
    const userEmail = req.customer.email;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorEmail !== userEmail) {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    const postId = comment.postId;
    await Comment.findByIdAndDelete(req.params.id);

    // Decrement commentCount on post
    const post = await CommunityPost.findById(postId);
    if (post) {
      post.commentCount = Math.max(0, post.commentCount - 1);
      await post.save();
    }

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
