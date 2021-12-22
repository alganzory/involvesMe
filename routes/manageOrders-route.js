const express = require('express');
const router = express.Router();

const { checkAuthenticated, checkNotAutheticated } = require('../controllers/authController');
router.get('/', checkAuthenticated, (req, res) => {
    // this is temportary until landing page is created
    res.render('manageOrder', {
        type: req.user.type

    });

});

module.exports = router;