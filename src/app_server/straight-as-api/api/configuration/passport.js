var passport = require('src/app_server/straight-as-api/api/configuration/passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

// Set local strategy
passport.use(new LocalStrategy({
        usernameField: 'email',     // set email property name
        passwordField: 'password'   // set password property name
    },
    function(email, password, done) {
        User.findById(email).exec(   // Find user by their e-mail
            function(error, user) {
                if (error) {            // If encountered error...
                    return done(error);
                }
                if (!user) {            // If user not found...
                    return done(null, false, {
                        message: 'Wrong e-mail or password'
                    });
                }
                if (!user.checkPassword(password)) {     // If password incorrect...
                    return done(null, false, {
                        message: 'Wrong e-mail or password'
                    });
                }
                return done(null, user);    // If all went well...
            }   
        );
    }
));
