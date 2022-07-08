const express = require('express');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const router = express.Router();
const User = require('./../models/User');
const keys = require('./../config/keys');
const validateRegisterInput = require('./../validation/register');
const validateLoginInput = require('./../validation/login');
const validateUserUpdateInput = require('./../validation/userUpdate');
const validateChangePasswordInput = require('./../validation/changePassword');


router.post('/register', (req, res) => {
	//Check with validator if the name is between 2 and 30 char
	//If validator.errors.length > 0 it should throw error with status 422
	const validateRequest = validateRegisterInput(req.body);

	if(validateRequest.hasError){
		return res.status(422).json({
			msg: "Validation error",
			errors : validateRequest.errors
		});
	}

	User.findOne({email:req.body.email}).then((user) => {
		console.log(user)
		if(user){
			return res.status(400).json({email :  "Email already exists"});
			
		}

		const avatar = gravatar.url(req.body.email, {
			s:'200',
			r:'pg',
			default:'mm'
		})

		const newUser = new User({
			name: req.body.name,
			email: req.body.email,
			password: req.body.password,
			avatar,
		});

		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(newUser.password, salt, (err, hash) => {
				if(err) throw new Error(err);
				newUser.password = hash;
				newUser
					.save()
					.then((user) =>
						res.status(201).json({ msg: 'Successfully registered', user })
					).catch(err => console.log(err))
			})
		});
	});
});

router.post('/login', (req, res) => {
	const email = req.body.email;
	const password = req.body.password;

	const validateRequest = validateLoginInput(req.body);

	if(validateRequest.hasError){
		return res.status(422).json({
			msg: "Validation error",
			errors : validateRequest.errors
		});
	}

	User.findOne({email}).then(user => {
		if(!user){
			return res.status(404).json({ msg : "User not found" });
		}
		bcrypt.compare(password,user.password).then(isMatch => {
			if(isMatch){
				const payload = {
					id: user.id,
					name:user.name,
				}
				jwt.sign(
					payload,
					keys.jwtSecret,
					{
						expiresIn:3600
					},
					(err, token) => {
						res.json({
							success: true,
							token: `Bearer ${token}`
						})
					}
				)
			} else {
				return res.status(400).json({msg : 'Password incorrect'})
			}
		})
	})

});

router.get('/me', passport.authenticate('jwt', {session:false}), (req,res) => {
	res.json({
		id: req.user.id,
		name: req.user.name,
		email: req.user.email,
	})
});

router.put('/me', passport.authenticate('jwt', {session:false}), (req,res) => {
	const validateRequest = validateUserUpdateInput(req.body);

	if (validateRequest.hasError) {
		return res.status(422).json({
			msg: 'Validation error',
			errors: validateRequest.errors,
		});
	}
	
	User.findOne({_id: req.user.id}).then(async (user) =>{
		if(!user){
			return res.status(404).json({msg : "User not found"});
		}
		
		const userEmail = await User.findOne({email:req.body.email});
		
		if (userEmail && user._id.toString() != userEmail._id.toString()) {
			return res.status(400).json({ msg: 'Email already exists!' });
		}

		User.findOneAndUpdate({ _id: user.id},{
			$set : {
				name: req.body.name,
				email: req.body.email
			},
		},
		{
			new:true
		}).then(updateUser => res.json(updateUser))
			.catch(error => res.status(500).json({msg : 'Something went wrong!'}))
	})
});

router.put(
	'/changePassword',
	passport.authenticate('jwt', { session: false }),
	async (req, res) => {
		const { oldPassword, password, passwordConfirm } = req.body;
		
		const validateRequest = validateChangePasswordInput(req.body);

		if (validateRequest.hasError) {
			return res.status(422).json({
				msg: 'Validation error',
				errors: validateRequest.errors,
			});
		}
		const user = await User.findOne({_id : req.user.id});
		
		if (!user) {
			return res.status(404).json({ msg: "User not found" });
		}

		bcrypt.compare(oldPassword, user.password, (err, isMatch) => {
			if (err) throw new Error(err);

			if (isMatch) {
				bcrypt.genSalt(10, async (err, salt) => {
					bcrypt.hash(password, salt, async (err, hash) => {
						if (err) throw new Error(err);

						user.password = hash;
						await user.save();
						
						return res.json({ msg: 'Password changed' });
					});
				});
			} else {
				return res.status(400).json({ msg: 'Password incorrect' });
			}
		});
	}
);

module.exports = router;
