const express = require('express');
const router = express.Router();
const walletController = require("../controllers/walletController");
const {checkAuthenticated} = require('../controllers/authController');


router.get("/", checkAuthenticated, walletController.getWallet);
router.post("/withdraw", checkAuthenticated, walletController.withdrawMoney);

module.exports = router;