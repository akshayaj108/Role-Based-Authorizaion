const jwt = require("jsonwebtoken");
const recordsModel = require("../model/records");

class checkMiddleAuth {
  static checkEditAuthority = async (req, res, next) => {
    let token;
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith("Bearer")) {
      try {
        //Get Token from User
        token = authorization.split(" ")[1];
        console.log(authorization);

        const { userID } = jwt.verify(token, process.env.SecretKey);
        console.log(userID);
        //after verification Get User from Token
        req.user = await recordsModel.findById(userID).select("-pass");
        console.log(req.user.roleTypeId);
      } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Unauthorized User !!" });
      }
    }

    if (!token) {
      res.send("Unauthorize user with No token!!");
    }
    if (req.user.roleTypeId === 2 || req.user.roleTypeId === 1) {
      next();
    } else {
      res.status(401).json({ message: "You haven't authority " });
    }
  };

  static checkAdminAuth = async (req, res, next) => {
    const { authorization } = req.headers;
    let token;
    if (authorization && authorization.startsWith("Bearer")) {
      try {
        token = await authorization.split(" ")[1];
        const { decode } = await jwt.verify(token, process.env.SecretKey);
        console.log(decode);
        var admin = await recordsModel.findById(decode);
        console.log(admin.roleTypeId);
      } catch (error) {
        res.status(400).json({ message: "Unauthorize User" });
        console.log(error);
      }
    }
    if (!token) {
      res.send("Unauthorize user with No token!!");
    }
    if (admin.roleTypeId === 1) {
      next();
    } else {
      res.status(401).json({ message: "You Haven't Authority" });
    }
  };
}
module.exports = checkMiddleAuth;
