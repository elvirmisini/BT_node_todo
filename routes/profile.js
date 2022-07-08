const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const User = require('./../models/User');
const Profile = require('./../models/Profile');
const validateProfileInput = require('./../validation/profile');
const validateExperienceInput = require('./../validation/experience');
const validateEducationInput = require('./../validation/education');
const { remove } = require('./../models/User');

router.get('/',passport.authenticate('jwt', {session: false}), (req, res) => {

	Profile.findOne({user: req.user.id})
		.then(profile => {
			if(!profile){
				res.status(404).json({msg : "Profile not found"});
			}

			res.json(profile)
		}).catch(error => res.status(500).json(error))
});

router.post('/',passport.authenticate('jwt', {session: false}), (req, res) => {

	const profileData = {
		user: req.user.id,
		handle: req.body.handle ? req.body.handle : '',
		status: req.body.status ? req.body.status : '',
		skills:
			req.body.skills && typeof req.body.skills === 'string'
				? req.body.skills.split(',')
				: '',
		company: req.body.company ? req.body.company : undefined,
		website: req.body.website ? req.body.website : undefined,
		location: req.body.location ? req.body.location : undefined,
		bio: req.body.bio ? req.body.bio : undefined,
		githubusername: req.body.githubusername ? req.body.githubusername : undefined,
		social: {}
	};

	if (req.body.youtube) profileData.social.youtube = req.body.youtube;
	if (req.body.twitter) profileData.social.twitter = req.body.twitter;
	if (req.body.facebook) profileData.social.facebook = req.body.facebook;
	if (req.body.linkedin) profileData.social.linkedin = req.body.linkedin;
	if (req.body.instagram) profileData.social.instagram = req.body.instagram;

	const validateRequest = validateProfileInput(profileData);

	if (validateRequest.hasError) {
		return res.status(422).json({
			msg: 'Validation error',
			errors: validateRequest.errors,
		});
	}

	Profile.findOne({user : req.user.id}).then(profile => {
		if(profile){
			Profile.findOneAndUpdate(
				{ user: req.user.id },
				{
					$set: profileData,
				},
				{
					new:true
				}
			).then(profile => res.json(profile));
		}else{
			Profile.findOne({handle : profileData.handle}).then(user => {
				if (user){
					return res.status(400).json({
						handle:"That handle already exists"
					});
				}
				new Profile(profileData).save().then((newProfile) => res.json(newProfile));
			})
		}
	})

});

router.get('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
				msg: "Validation error",
				erorr: "Invalid Id"
		});
	}

	Profile.findOne({ _id: mongoose.Types.ObjectId(id) }).then(doc => {
			if (!doc) {
				return res.status(404).send({
						msg: "Not found",
				});
			}
			return res.json(doc);
	}).catch(err => {
			res.status(500).send({
					msg: "Server error",
					erorr: "Error"
			})
	});
});

router.get(
	'/handle/:handle',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		const { handle } = req.params;

		Profile.findOne({ handle })
			.populate('user', ['name', 'email', 'avatar'])
			.then((profile) => {
				if (!profile) {
					return res.status(404).send({
						msg: 'Not found',
					});
				}
				return res.json(profile);
			})
			.catch((err) => {
				res.status(500).send({
					msg: 'Server error',
					erorr: 'Error',
				});
			});
	}
);

router.get('/all/users', (req, res) => {
  const whereConditions = [];
	if (req.query.status) {
		whereConditions.push({ status: req.query.status });
	}
	if (req.query.experienceCompany) {
		whereConditions.push({ 'experience.company': req.query.experienceCompany });
	}
		Profile.find({
			$or: whereConditions,
		})
			.populate('user', ['name', 'avatar'])
			.then((profiles) => {
				if (!profiles) {
					return res.status(404).json({ msg: 'Not found any profiles' });
				}
				res.json(profiles);
			})
			.catch((error) => {
				console.log(error);
				res.status(404).json({ msg: 'Not found any profiles' });
			});
})

router.post('/experience',passport.authenticate('jwt', {session: false}), (req, res) => {
	const validateRequest = validateExperienceInput(req.body);

	if (validateRequest.hasError) {
		return res.status(422).json({
			msg: 'Validation error',
			errors: validateRequest.errors,
		});
	}

	Profile.findOne({user: req.user.id}).then(profile => {
		if(!profile){
			return res.status(404).json({msg : "Profile not found!"})
		}

		const experience = {
			title: req.body.title,
			company: req.body.company,
			from: req.body.from,
			to: req.body.to,
			current: req.body.current,
			description: req.body.description,
		};

		profile.experience.unshift(experience);
		profile.save().then(profile => res.json(profile));
	})
});

router.post(
	'/education',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		const validateRequest = validateEducationInput(req.body);
		if (validateRequest.hasError) {
			return res.status(422).json({
				msg: 'Validation error',
				errors: validateRequest.errors,
			});
		}
		Profile.findOne({ user: req.user.id }).then((profile) => {
			if (!profile) {
				return res.status(404).json({ msg: 'Profile not found!' });
			}
			const education = {
				school: req.body.school,
				degree: req.body.degree,
				fieldofstudy: req.body.fieldofstudy,
				from: req.body.from,
			};
			profile.education.unshift(education);
			profile.save().then((profile) => res.json(profile));
		});
	}
);

router.delete('/experience/:expId', passport.authenticate('jwt', { session: false }), (req,res) => {
	Profile.findOne({user: req.user.id}).then(profile => {
		if(!profile){
			res.status(404).json({msg: "Profile not found!"});
		}

		const removeIndex = profile.experience.map(p => p.id).indexOf(req.params.expId);
		profile.experience.splice(removeIndex,1);

		profile
			.save()
			.then((profile) => res.json(profile))
			.catch((error) => res.status(404).json({ msg: 'Profile not found!' }));
	})
});

router.delete('/education/:edId', passport.authenticate('jwt', { session: false }), (req,res) => {
	Profile.findOne({user: req.user.id}).then(profile => {
		if(!profile){
			res.status(404).json({msg: "Profile not found!"});
		}
		
		profile.education = profile.education.filter(education => education.id != req.params.edId);

		profile
			.save()
			.then((profile) => res.json(profile))
			.catch((error) => res.status(404).json({ msg: 'Profile not found!' }));
	})
});

router.delete('/', passport.authenticate('jwt', { session: false }), (req,res) => {
	Profile.findOneAndRemove({user:req.user.id}).then(() => {
		res.json({removed:true})
	}).catch(error => {
		res.status(404).json('Profile not found')
	})
});

module.exports = router;
