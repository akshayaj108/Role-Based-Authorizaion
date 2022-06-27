const recordsModel = require("../model/records");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
        if (role == "admin") {
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
                role: role,
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
        if (role == "user" || role == "viewers") {
          try {
            let salt = await bcrypt.genSalt(12);
            let hashPassword = await bcrypt.hash(pass, salt);
            let data;
            data = await new recordsModel({
              name: name,
              email: email,
              role: role,
              pass: hashPassword,
              message: message,
            });
            await data.save();
            res.status(200).json({ message: "Registered Successfully" });
          } catch (err) {
            res.send("Unable Add Record");
            throw err;
          }
        } else {
          res.status(401).json({
            message: "Please choose valid Role. you entered role is invalid",
          });
        }
      }
    } else {
      res.status(400).json({ message: "All fields are Reqired!!" });
    }
  };

  //api for admin , users, and viewers to get all data:
  static viewAllMessages = async (req, res) => {
    try {
      let messages = await recordsModel.find().select("-pass -email");
      console.log(messages);
      res.status(200).json(messages);
    } catch (error) {
      res.status(400).json({ message: "Unable To show" });
      throw error;
    }
  };
}

module.exports = userOperation;
