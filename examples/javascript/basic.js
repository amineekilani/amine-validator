const { isEmail, isStrongPassword, validate } = require('amine-validator');

console.log(isEmail('example@domain.com'));
console.log(isStrongPassword('Password1!'));

const result = validate({
  email: {
    value: 'user@example.com',
    rules: ['required', 'email'],
  },
  password: {
    value: 'SecurePass1!',
    rules: ['required', 'strongPassword'],
  },
});

console.log(result.isValid);
