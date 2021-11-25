
const express = require('express')

var router = express.Router()

router.get('/me',(req, res)=>{

    res.render('profile',{title:"My Profile"})
})

router.get('/:username',(req, res)=>{
    
   res.render('profile',{title:req.params.username})//start render the data fetched from database to 
                                        //dynamic profile page
})
router.get('/',(req, res)=>{

    res.render('profile',{title:"Profile"})
})
router.post('/edit', (req, res)=>{
    //fecth data from profile form 
    res.send('this is profile editing page')
    //then update the database
})

module.exports=router