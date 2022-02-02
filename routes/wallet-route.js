const express = require('express');
const router = express.Router();
const walletController = require("../controllers/walletController");
const {checkAuthenticated} = require('../controllers/authController');


router.get("/", checkAuthenticated, walletController.getWallet);
router.post("/withdraw", checkAuthenticated, walletController.withdrawMoney);
router.post("/dontePaypal", checkAuthenticated, walletController.dontePaypal);
router.get('/success/:id/:type/:amount/:points', checkAuthenticated,walletController.paymentSuccess);
router.get('/cancelPayment', checkAuthenticated,walletController.paymentCancelled);

module.exports = router;