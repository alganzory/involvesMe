const express = require('express');
const router = express.Router();

const {checkAuthenticated, checkNotAutheticated} = require('../controllers/authController');
router.get('/', checkAuthenticated, (req, res) => {
   // this is temportary until landing page is created
    res.send (`<h1> landing page </h1>
    </br>   
    </br>
    <h3> email: ${req.user.email} </h3>
    </br>
    <h3>
    username: ${req.user.username}
    </h3>
    </br>
    <h3>
    source: ${req.user.source}
    <h3>
    </br>
    <h3>
    password: ${req.user.password}
    <h3>
    </br>
    <form method="POST" action="/auth/logout" >  <button type="submit">Logout</button> </form>
    <form method="GET" action="/account" >  <button type="submit">Account</button> </form>
    `)
});

module.exports = router;