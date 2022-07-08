const Validatior = require('validator');
const isEmpty = require('./isEmpty')


module.exports = function validateProfileInput(data){
	let errors = {};
		
	if (Validatior.isEmpty(data.handle)) {
		errors.handle = 'Handle field is empty';
	}

	if(!Validatior.isLength(data.handle, {max:40})){
		errors.handle = "handle must be lower than 40 characters";
	}
	
	if(Validatior.isEmpty(data.status)){
		errors.status = "status field is empty";
	}

	if (isEmpty(data.skills)) {
		errors.skills = 'skills field is empty';
	}

	return {
		errors,
		hasError: !isEmpty(errors),
	};
}
