function minMax(whatVar, describeAs, min, max) {
  if (!whatVar) return `${describeAs} has to be filled in!`;
  whatVar = whatVar.toString().trim();
  if (whatVar.length < min)
    return `${describeAs} has to be longer than ${min} characters!`;
  else if (whatVar.length > max)
    return `${describeAs} has to be less than ${max} characters!`;
  else return true;
}

//Alphanumeric and digits, between 3 and 50 characters and no whitespace
function validateName(name) {
  if (!name) return false;
  name = name.toString().trim();
  //Must be alphanumeric or digits, no whitespace and be between 3 and 50 characters
  const nameRegex = /^[a-zA-Z0-9]{3,50}$/;
  return nameRegex.test(name);
}

//No whitespace and above 6 characters
function validatePassword(password) {
  if (!password) return false;
  password = password.toString().trim();
  const passRegex = /^[^\s]{6,200}$/;
  return passRegex.test(password);
}

module.exports = {
  minMax,
  validateName,
  validatePassword
};
