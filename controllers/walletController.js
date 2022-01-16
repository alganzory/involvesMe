const walletService = require("../models/wallet-model");
const UserService = require("../models/user-Model");
const uuid = require("uuid");
const paypal = require('paypal-rest-sdk');

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
        await walletService.updateWallet(userWallet.id, userWallet);
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
const dontePaypal = async (req, res) => {
    var receiverId = req.body.receiverId;
    var donateAmount = req.body.donateAmount;
    var dontationType = req.body.type;
    var pointsAmount = 0;
    var userWallet = await walletService.getWalletByuserId(receiverId);
    var receiver = await UserService.getUserById(receiverId);
    if (userWallet == null) {
        userWallet = {
            id: uuid.v4(),
            userId: receiverId,
            balance: 0,
            points: 0
        }
        await walletService.addWallet(userWallet);
    }

    if (dontationType == "points") {
        pointsAmount = donateAmount;
        donateAmount = pointsAmount * 0.01;
    }

    if (donateAmount <= 0) {
        req.flash("error", "Donatation must be more then 0 MYR");
        res.redirect("/profile/" + receiver.username);
    }
    else {
        var create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/wallet/success/" + receiverId + "/" + dontationType + "/" + donateAmount + "/" + pointsAmount + "/",
                "cancel_url": "http://localhost:3000/wallet/cancelPayment"
            },
            "transactions": [{

                "amount": {
                    "currency": "MYR",
                    "total": donateAmount
                },
                "description": "Your Involves Donation"
            }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                throw error;
            } else {
                for (var i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        res.redirect(payment.links[i].href);
                    }

                }
            }
        });
    }
};

const paymentSuccess = async (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const receiverId = req.params.id;
    const dontationType = req.params.type;
    const donateAmount = req.params.amount;
    const pointsAmount = req.params.points;

    var receiver = await UserService.getUserById(receiverId);
    var userWallet = await walletService.getWalletByuserId(receiverId);
    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "MYR",
                "total": donateAmount
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            if (dontationType == "points") {
                userWallet.points = Number(userWallet.points) + Number(pointsAmount);
            }
            else {
                userWallet.balance = Number(userWallet.balance) + Number(donateAmount);
            }
            await walletService.updateWallet(userWallet.id, userWallet);
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            req.flash("Success", "Payment Successful.");
            res.redirect("/profile/" + receiver.username);
        }
    });
};
const paymentCancelled = async (req, res) => {
    req.flash("error", "Payment Failed or Cancelled");
    res.redirect("/");
};

module.exports = {
    getWallet,
    withdrawMoney,
    dontePaypal,
    paymentSuccess,
    paymentCancelled
}