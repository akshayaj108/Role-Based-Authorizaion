const recordsModel = require("../model/records");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

function RoleCase(string) {
  var sentence = string.toLowerCase().split(" ");
  for (var i = 0; i < sentence.length; i++) {
    sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
  }
  sentence.join(" ");
  return sentence;
}

class userOperation {
  //signup api code
  static recordSignUp = async (req, res) => {
    const { name, email, role, pass, message } = req.body;
    if (name && email && role && pass) {
      let record = await recordsModel.findOne({ email: email });
      if (record) {
        res
          .status(400)
          .json({ message: "This Email is Already Exists in Records" });
      } else {
        if (role == "admin" || role == "Admin") {
          let userRole = await recordsModel.findOne({ role: role });
          if (userRole) {
            res.status(401).json({
              message:
                "Only One Admin have authorize to be admin and there is Exists!!",
            });
          } else {
            try {
              let salt = await bcrypt.genSalt(12);
              let hashPassword = await bcrypt.hash(pass, salt);
              let data;
              data = await new recordsModel({
                name: name,
                email: email,
                role: RoleCase(role),
                roleTypeId: 1,
                pass: hashPassword,
                message: message,
              });
              await data.save();
              res.status(200).json({ message: "Registered Successfully" });
            } catch (err) {
              res.send("Unable Add Record");
              throw err;
            }
          }
        }
        if (role == "user" || role == "User") {
          try {
            let salt = await bcrypt.genSalt(12);
            let hashPassword = await bcrypt.hash(pass, salt);
            let data;
            data = await new recordsModel({
              name: name,
              email: email,
              role: RoleCase(role),
              roleTypeId: 2,
              pass: hashPassword,
              message: message,
            });
            await data.save();
            res.status(200).json({ message: "Registered Successfully" });
          } catch (err) {
            res.send("Unable Add Record");
            throw err;
          }
        } else if (role == "viewer" || role == "Viewer") {
          try {
            let salt = await bcrypt.genSalt(12);
            let hashPassword = await bcrypt.hash(pass, salt);
            let data;
            data = await new recordsModel({
              name: name,
              email: email,
              role: RoleCase(role),
              roleTypeId: 3,
              pass: hashPassword,
              message: message,
            });
            await data.save();
            res.status(200).json({ message: "Registered Successfully" });
          } catch (err) {
            res.send("Unable Add Record");
            throw err;
          }
        }
      }
    } else {
      res.status(400).json({ message: "All fields are Reqired!!" });
    }
  };

  //api for admin , users, and viewers to get all data:
  static viewAllMessages = async (req, res) => {
    try {
      let messages = await recordsModel.find();
      console.log(messages);
      res.status(200).json(messages);
    } catch (error) {
      res.status(400).json({ message: "Unable To show" });
      throw error;
    }
  };

  //login api code
  static userLogin = async (req, res) => {
    const { email, password } = req.body;
    if (email && password) {
      let user = await recordsModel.findOne({ email: email });
      if (user) {
        try {
          let checkLogin = await bcrypt.compare(password, user.pass);
          if (!checkLogin) {
            res.status(400).json({ message: "Invalid Email or Password" });
          } else {
            let token = jwt.sign(
              { userID: user._id, roleID: user.roleTypeId },
              process.env.SecretKey,
              { expiresIn: "20m" }
            );
            res
              .status(200)
              .json({ Status: "Login Successfull", "Your Token": token });
          }
        } catch (error) {
          console.log(error);
          res.status(400).json({ message: "Unable to Process" });
        }
      } else {
        res.status(400).json({ message: "Account Email Doesn't Exists!!" });
      }
    } else {
      res.status(400).json({ message: "All Fields are Required!!" });
    }
  };

  //for Edit/Update message api for users and admin
  static messageUpdate = async (req, res) => {
    const { email, editMessage } = req.body;
    if (!email) {
      let user = await recordsModel.findOne({ email: email });
      if (!user) {
        res.status(400).json({ message: "This Email Doesn't Exists!!" });
      } else {
        try {
          await recordsModel.findByIdAndUpdate(user._id, {
            $set: { message: editMessage },
          });
          user = await recordsModel.findById(user._id).select("-pass");
          res.status(200).json({
            status: "Message Updated Successfully",
            "Updated Content": user.message,
          });
        } catch (error) {
          res.send("Have an Error Unable to process");
          console.log(error);
        }
      }
    } else {
      res.status(400).json({ message: "All Fields are required" });
    }
  };

  //Delete authorization api code only for admin
  static deleteMessage = async (req, res) => {
    const { email } = req.body;
    if (email) {
      let user = await recordsModel.findOne({ email: email });
      if (user) {
        try {
          await recordsModel.findByIdAndDelete(user._id, {
            $unset: { message: "" },
          });
        } catch (error) {
          console.log(error);
          res.send("Unable to delete");
        }
      }
    } else {
      res.status(400).json({ message: "Email field is required!!" });
    }
  };

  static changeAdmin = async (req, res) => {
    const { adminEmail, userEmail } = req.body;
    let adminRole = "Admin";
    let userRole = "User";
    if (adminEmail && userEmail) {
      let admin = await recordsModel.findOne({ eamil: adminEmail });
      let user = await recordsModel.findOne({ email: userEmail });
      if (admin && user) {
        try {
          await recordsModel.findByIdAndUpdate(admin._id, {
            $set: { role: userRole, roleTypeId: 2 },
          });
          await recordsModel.findByIdAndUpdate(user._id, {
            $set: { role: adminRole, roleTypeId: 1 },
          });
        } catch (error) {
          res.json({ message: "Unable to Process!!" });
        }
      } else {
        res
          .status(401)
          .json({ message: "Admin or User Account Email  Doesn't Exists!!" });
      }
    } else {
      res.status(400).json({ message: "Email Field is Required!!" });
    }
  };
}

module.exports = userOperation;
