const Validatior = require('validator');
const isEmpty = require('./isEmpty')


module.exports = function validateExperienceInput(data){
	let errors = {};
		
	if (Validatior.isEmpty(data.title)) {
		errors.title = 'Title field is empty';
	}

	if(Validatior.isEmpty(data.company)){
		errors.company = "company field is empty";
	}

	if (Validatior.isEmpty(data.from)) {
		errors.from = 'from field is empty';
	}

	return {
		errors,
		hasError: !isEmpty(errors),
	};
}
