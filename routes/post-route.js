const express = require('express');
const router = express.Router();

const postController = require("../controllers/postController")
const { checkAuthenticated, checkNotAutheticated } = require('../controllers/authController');

router.get('/:id', checkAuthenticated,postController.get_product);
  

module.exports=router;
