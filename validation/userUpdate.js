const Validatior = require('validator');
const isEmpty = require('./isEmpty')


module.exports = function validateUserUpdateInput(data) {
	let errors = {};

	data.name = !isEmpty(data.name) ? data.name : '';

	data.email = !isEmpty(data.email) ? data.email : '';

	if (Validatior.isEmpty(data.name)) {
		errors.name = 'Name field is empty';
	}

	if (!Validatior.isLength(data.name, { min: 2, max: 30 })) {
		errors.name = 'Name must be between 2 and 30 characters';
	}

	if (Validatior.isEmpty(data.email)) {
		errors.email = 'Email field is empty';
	}

	if (!Validatior.isEmail(data.email)) {
		errors.email = 'Email must has correct format';
	}

	return {
		errors,
		hasError: !isEmpty(errors),
	};
};
