const express = require("express");

const router = express.Router();
const methodOverride = require('method-override');


//new 
const jwt = require('jsonwebtoken');
const { application } = require("express");
router.use (express.json())
router.use (express.urlencoded({extended: false}));
//end
router.get('/forget-password', (req, res, next) => {
    res.render('forget-password', {title: "Forget Password"});
  });

module.exports = router;