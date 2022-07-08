const Validatior = require('validator');
const isEmpty = require('./isEmpty')


module.exports = function validateChangePasswordInput(data) {
	let errors = {};

	data.oldPassword = !isEmpty(data.oldPassword) ? data.oldPassword : '';
	
	data.password = !isEmpty(data.password) ? data.password : '';

	data.passwordConfirm = !isEmpty(data.passwordConfirm)
		? data.passwordConfirm
		: '';

	if (Validatior.isEmpty(data.oldPassword)) {
		errors.oldPassword = 'OldPassword field is empty';
	}

	if (Validatior.isEmpty(data.password)) {
		errors.password = 'Password field is empty';
	}

	if (Validatior.isEmpty(data.passwordConfirm)) {
		errors.passwordConfirm = 'Password confirm field is empty';
	}

	if (!Validatior.isLength(data.password, { min: 3, max: 12 })) {
		errors.password = 'Password must be between 3 and 12 characters';
	}

	if (!Validatior.equals(data.password, data.passwordConfirm)) {
		errors.password = 'Passwords must match';
	}

	return {
		errors,
		hasError: !isEmpty(errors),
	};
};
