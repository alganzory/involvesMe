const express = require('express')
const router = express.Router()

const {checkAuthenticated} = require('../controllers/authController');
const profileController = require('../controllers/profileController');

router.get('/me',checkAuthenticated,profileController.get_myprofile);
router.get('/:username',profileController.get_profile);
router.post('/edit',checkAuthenticated, profileController.upload_photo, profileController.edit_myprofile);
router.post('/addTwitter',checkAuthenticated,profileController.add_Twitter);
router.post('/addFacebook',checkAuthenticated,profileController.add_Facebook);
router.post('/addYoutube',checkAuthenticated,profileController.add_Youtube);
router.post('/addPatreon',checkAuthenticated,profileController.add_Patreon);
router.post('/follow',checkAuthenticated,profileController.followUser);
router.post('/removeFollower',checkAuthenticated,profileController.removeFollower);
router.post('/addpost',checkAuthenticated,profileController.add_post);
router.get('/', (req,res) => {
    res.redirect ('/profile/me')
});

module.exports=router;