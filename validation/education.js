const Validatior = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateEducationInput(data) {
	let errors = {};
	if (Validatior.isEmpty(data.school)) {
		errors.school = 'School field is empty';
	}
	if (Validatior.isEmpty(data.degree)) {
		errors.degree = 'Degree field is empty';
	}
	if (Validatior.isEmpty(data.fieldofstudy)) {
		errors.fieldofstudy = 'from field is empty';
	}
	if (Validatior.isEmpty(data.from)) {
		errors.from = 'From field is empty';
	}
	return {
		errors,
		hasError: !isEmpty(errors),
	};
};
