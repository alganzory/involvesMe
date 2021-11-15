const express = require("express");

const router = express.Router();
const methodOverride = require('method-override');


//new 
const jwt = require('jsonwebtoken');
const { application } = require("express");
router.use (express.json())
router.use (express.urlencoded({extended: false}));
//end

// new a user
let user = {
    id: 'lakdjfvbnkj2424t2',
    email: 'zhang@gmail.com',
    password: "asjdnvkjasndva;'wprihjgieprhjg324909",
  };

//for test 
router.get('/reset-password', (req, res, next) => {
    res.render('reset-password');
  });


router.get('/forget-password', (req, res, next) => {
    res.render('forget-password', {title: "Forget Password"});
  });


router.post('/forget-password', (req, res, next) =>{
  
    const {email} = req.body;
    res.send(email)
});
module.exports = router;