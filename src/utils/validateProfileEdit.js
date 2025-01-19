const validateEditProfile = (req) => {
  const data = req.body;
  console.log(data);
  const ALLOWED_UPDATES = [
    "age",
    "photoURL",
    "firstName",
    "lastName",
    "about",
    "skills",
    "gender",
    "company",
    "designation",
  ];
  const isValidToEdit = Object.keys(data).every((field) => {
    console.log(field);
    return ALLOWED_UPDATES.includes(field);
  });
  return isValidToEdit;
};

module.exports = validateEditProfile;
