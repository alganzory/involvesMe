const express = require('express')
const router = express.Router()

const {checkAuthenticated} = require('../controllers/authController');
const profileController = require('../controllers/profileController');

router.get('/me',checkAuthenticated,profileController.get_myprofile);
router.get('/:username',profileController.get_profile);
router.post('/edit',checkAuthenticated,profileController.edit_myprofile);
//router.post('/addpost',checkAuthenticated,profileController.add_post); for future implementation

module.exports=router;