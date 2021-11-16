const passport = require("passport");
const User = require("./models");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');



function initialize(passport) {
    console.log("initialize");
    passport.use(new LocalStrategy({usernameField:"email"},
        async function(email, password, done) {

            const currentUser = await User.getUserByEmail({ email });

            if (!currentUser) {
                return done(null, false, { message: `User with email ${email} does not exist` });
            }

            if (!bcrypt.compareSync(password, currentUser.password)) {
                return done(null, false, { message: `Incorrect password provided` });
            }
            return done(null, currentUser);
        }
    ));
}
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async(id, done) => {
    const currentUser = await User.getUserById({ id });
    done(null, currentUser);
});
module.exports = initialize;
