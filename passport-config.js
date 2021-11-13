const LocalStrategy = require('passport-local').Strategy;
const bcrypt=require('bcrypt');

function initialize(passport,getUserByEmail, getUserById){ 

    const authenticateUser =async (email, password, done) => { 
        const user = getUserByEmail(email);
        if(user == null){
            return done(null, false, {message: 'Invalid email or password'});
        }

        try{
            if(!bcrypt.compareSync(password, user.password)){
                return done(null, false, {message: 'Invalid email or password'});
            } else {
                return done(null, user);
            }
        } catch(error){
            return done(error);
        }
    }

    passport.use (new LocalStrategy ({usernameField:"email"},authenticateUser)
    );
    passport.serializeUser((user, done) => {
        done(null, user.id);     
    });
    passport.deserializeUser((id, done) => {
        const user = getUserById(id);
        if(user){
            done(null, user);
        } else {
            done(new Error('User not found'));
        }
      
    });
}

module.exports = initialize;
