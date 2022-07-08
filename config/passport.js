const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');

const User = mongoose.model('users');
const keys = require('./keys');

const opts = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: keys.jwtSecret
};

module.exports = passport => {
	passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
		User.findById(jwt_payload.id).then(user => {
			if(user){
				return done(null,user);
			}
			done(null,false);
		})
		.catch(err => console.log(err))
	}))
}
