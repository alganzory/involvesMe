const express = require('express');
const router = express.Router();

const postController = require("../controllers/postController")
const { checkAuthenticated, checkNotAutheticated } = require('../controllers/authController');

router.get('/addPost', checkAuthenticated,postController.get_makePost);
router.get('/:id', checkAuthenticated,postController.get_product);
router.post('/delete', checkAuthenticated, postController.deletePost);
router.post('/edit', checkAuthenticated, postController.editPost);
router.post('/makePost', checkAuthenticated,postController.makePost);

module.exports=router;
