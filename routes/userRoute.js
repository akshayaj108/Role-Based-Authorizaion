const express = require("express");
const router = express.Router();
const userOperation = require("../control/userOperation");

router.post("/signup", userOperation.recordSignUp);
router.get("/viewall", userOperation.viewAllMessages);

//protected route to special authorizer

module.exports = router;
