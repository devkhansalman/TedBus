const express = require('express');
const router = express.Router();
const communityController = require('../controllers/community');
const { requireAuthenticatedCustomer } = require('../controllers/customer');

// Posts routes
router.get('/community/posts', communityController.getPosts);
router.get('/community/posts/:id', communityController.getPostById);
router.post('/community/posts', requireAuthenticatedCustomer, communityController.createPost);
router.put('/community/posts/:id', requireAuthenticatedCustomer, communityController.updatePost);
router.delete('/community/posts/:id', requireAuthenticatedCustomer, communityController.deletePost);
router.post('/community/posts/:id/like', requireAuthenticatedCustomer, communityController.likePost);

// Comments routes
router.get('/community/posts/:id/comments', communityController.getComments);
router.post('/community/posts/:id/comments', requireAuthenticatedCustomer, communityController.createComment);
router.delete('/community/comments/:id', requireAuthenticatedCustomer, communityController.deleteComment);

module.exports = router;
