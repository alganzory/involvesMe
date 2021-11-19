const express = require('express');
const router = express.Router();
const methodOverride = require('method-override');


const {checkAuthenticated} = require('../controllers/authController');


router.get("/", checkAuthenticated, (req, res) => {
        res.render("my-account", { title: "My Account" });
});


module.exports = router;