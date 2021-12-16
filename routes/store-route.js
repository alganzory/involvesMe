const express = require('express');
const router = express.Router();

const {checkAuthenticated, checkNotAutheticated} = require('../controllers/authController');
router.get('/', checkAuthenticated, (req, res) => {
   // this is temportary until landing page is created
    res.render('store');
});

module.exports = router;

router.get('/addProduct', checkAuthenticated, (req, res) => {
    // this is temportary until merge only
     res.render('addProduct');
});