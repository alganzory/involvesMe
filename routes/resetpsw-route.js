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
  const JWT_SECRET = 'some super secret...';
//for test 
router.get('/reset-password', (req, res, next) => {
    res.render('reset-password');
  });


router.get('/forget-password', (req, res, next) => {
    res.render('forget-password', {title: "Forget Password"});
  });


router.post('/forget-password', (req, res, next) =>{
  
    const {email} = req.body;
    
    if(email!== user.email){ //user not existing
        res.send("User not registered")
        return;
    }
    //1. create new secret
  const secret = JWT_SECRET+user.password//encrypy
  
  //2. create payload
  const payload ={
      email:user.email,
      id:user.id
  }

  //3. token
  const token = jwt.sign(payload, secret,{expiresIn: '10m'})//the link within 10 mins

  //4. create one time link from token
  const link = `http://localhost:5050/reset-password/${user.id}/${token}`;
  
  //5. test
  console.log(link)
  res.send("password reset link has been sent to your email...")
});

router.get('/reset-password/:id/:token', (req, res, next) => {
    res.render('reset-password');
});
module.exports = router;