if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const passport = require("passport");
const User = require("./models/user-Model");
const bcrypt = require("bcrypt");

const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const twitchStrategy = require("passport-twitch-new").Strategy;

passport.use(
  new LocalStrategy({ usernameField: "email" }, async function (
    email,
    password,
    done
  ) {
    const currentUser = await User.getUserByEmail(email);

    if (!currentUser) {
      return done(null, false, {
        message: `Invalid email or password`,
      });
    }
    if (currentUser.source !== "local"){
      if (!currentUser.password)
      return done (null, false, {message: "Account with this email address exists, try another login method"})
    }
    if (!bcrypt.compareSync(password, currentUser.password)) {
      return done(null, false, { message: `Invalid email or password`});
    }
    return done(null, currentUser);
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log (profile);
      const newUserData = {
        id: profile.id,
        email: profile.emails[0].value,
        username: profile.name.familyName + profile.id,
        profilePhoto: profile.photos[0].value,
        source: "google",
      };
      const user = await User.findOrCreate(profile.id, newUserData);
      console.log(user);
      done(null, user);
    }
  )
);

passport.use(new twitchStrategy({
    clientID: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    callbackURL: "/auth/twitch/redirect",
    scope: "user_read"
  },
  async function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    const newUserData = { 
      id: profile.id,
      username: profile.login + profile.id,
      profilePhoto: profile.profile_image_url,
      source: "twitch",
      email: profile.email
    }
    const user = await User.findOrCreate(profile.id, newUserData);
    done(null, user);
  }
));

passport.serializeUser((user, done) => {
  console.log(user.id);
  // this is the user id coming from the schema and not from mongodb _id
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const currentUser = await User.getUserById(id);
  done(null, currentUser);
});


