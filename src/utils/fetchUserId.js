const JWT = require("jsonwebtoken");
const fetchUserId = async (req) => {
  const cookie = req.cookies;
  try {
    const { token } = cookie;
    const decodedObject = await JWT.verify(token, "DEV@CONNECT@69");
    if (decodedObject) {
      const { id } = decodedObject;
      console.log(id);
      return id;
    } else {
      throw new Error("Unable to get cookie");
    }
  } catch (err) {
    throw new Error("Error :" + err.message);
  }
};
module.exports = fetchUserId;
