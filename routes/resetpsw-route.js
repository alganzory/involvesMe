const express = require("express");

const router = express.Router();
const methodOverride = require('method-override');


//new 
const jwt = require('jsonwebtoken');
const { application } = require("express");
router.use (express.json())
router.use (express.urlencoded({extended: false}));
//end


module.exports = router;