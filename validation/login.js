const Validatior = require('validator');
const isEmpty = require('./isEmpty')


module.exports = function validateLoginInput(data) {
	let errors = {};

	data.email = !isEmpty(data.email) ? data.email : '';

	data.password = !isEmpty(data.password) ? data.password : '';

	if (Validatior.isEmpty(data.email)) {
		errors.email = 'Email field is empty';
	}

	if (!Validatior.isEmail(data.email)) {
		errors.email = 'Email must has correct format';
	}

	if (Validatior.isEmpty(data.password)) {
		errors.password = 'Password field is empty';
	}

	if (!Validatior.isLength(data.password, { min: 3, max: 12 })) {
		errors.password = 'Password must be between 3 and 12 characters';
	}

	return {
		errors,
		hasError: !isEmpty(errors),
	};
};
