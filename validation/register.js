const Validatior = require('validator');
const isEmpty = require('./isEmpty')


module.exports = function validateRegisterInput(data){
	let errors = {};

	data.name = !isEmpty(data.name)
		? data.name
		: '';

	data.email = !isEmpty(data.email)
		? data.email
		: '';

	data.password = !isEmpty(data.password)
		? data.password
		: '';

	data.password_confirm = !isEmpty(data.password_confirm)
		? data.password_confirm
		: '';


	if (Validatior.isEmpty(data.name)) {
		errors.name = 'Name field is empty';
	}

	if(!Validatior.isLength(data.name, {min:2, max:30})){
		errors.name = "Name must be between 2 and 30 characters";
	}
	
	if(Validatior.isEmpty(data.email)){
		errors.email = "Email field is empty";
	}
	
	if(!Validatior.isEmail(data.email)){
		errors.email = "Email must has correct format";
	}

	if (Validatior.isEmpty(data.password)) {
		errors.password = 'Password field is empty';
	}

	if (Validatior.isEmpty(data.password_confirm)) {
		errors.password_confirm = 'Password confirm field is empty';
	}

	if (!Validatior.isLength(data.password, { min: 3, max: 12 })) {
		errors.password = 'Password must be between 3 and 12 characters';
	}	

	if(!Validatior.equals(data.password, data.password_confirm)){
		errors.password = "Passwords must match"
	}

	return {
		errors,
		hasError: !isEmpty(errors),
	};
}
