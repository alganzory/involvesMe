const walletService = require("../models/wallet-model");
const uuid = require("uuid");
const paypal = require('paypal-rest-sdk');
"use strict";
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AdwSTeWJSFnq0J5a2xC_Ny9-yNFiDgQZRKOoMdZBvqkKKgWwC2PbxmVgDjtt7wgrCb5NnGBdcHCZwVox',
    'client_secret': 'ECNDDF5DKBFvH_z18ac9UqLI4xqeIabAXJA8du1I9gUAdnsWB_K4sg-91ZQ1kW3QP5gLDovF1x7ONA1M'
});


const withdrawMoney = async (req, res) => {
    var userWallet = await walletService.getWalletByuserId(req.user.id);
    var paypalEmail = req.body.paypalEmail;
    console.log(paypalEmail)
    if (userWallet.balance <= 0) {
        req.flash("error", "Your Wallet is empty");
        res.redirect("/wallet/");
    }
    else {
        var sender_batch_id = Math.random().toString(36).substring(9);

        var create_payout_json = {
            "sender_batch_header": {
                "sender_batch_id": sender_batch_id,
                "email_subject": "You have a payment"
            },
            "items": [
                {
                    "recipient_type": "EMAIL",
                    "amount": {
                        "value": userWallet.balance,
                        "currency": "MYR"
                    },
                    "receiver": paypalEmail,
                    "note": "Thank you for using InvolvesMe.",
                    "sender_item_id": "item_3"
                }
            ]
        };

        paypal.payout.create(create_payout_json, function (error, payout) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                console.log("Create Payout Response");
                console.log(payout);
            }
        });
        userWallet.balance = 0;
        await walletService.updateWallet(userWallet.id,userWallet);
        req.flash("success", "You will receive your payment within 2-3 Working Days");
        res.redirect("/wallet/");
    }
};

const getWallet = async (req, res) => {
    var userWallet = await walletService.getWalletByuserId(req.user.id);
    console.log(userWallet)
    if (userWallet == null) {
        userWallet = {
            id: uuid.v4(),
            userId: req.user.id,
            balance: 0,
            points: 0
        }
        await walletService.addWallet(userWallet);
    }
    res.render("wallet", { userWallet: userWallet, title: "Wallet" });
};

module.exports = {
    getWallet,
    withdrawMoney
}