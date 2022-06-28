const express = require("express");
const router = express.Router();
const userOperation = require("../control/userOperation");
const middleAuth = require("../middleware/authMilleware");

router.post(
  "/signup",

  userOperation.recordSignUp
);
router.get("/viewall", userOperation.viewAllMessages);

//Login api code
router.post("/login", userOperation.userLogin);

//protected route to special authorizer
router.put(
  "/messageupdate",
  middleAuth.checkEditAuthority,
  userOperation.messageUpdate
);
//protected routes only admin can access
router.delete(
  "/admin/messagedelete",
  middleAuth.checkAdminAuth,
  userOperation.deleteMessage
);
router.put(
  "/admin/changeadmin",
  middleAuth.checkAdminAuth,
  userOperation.changeAdmin
);

module.exports = router;
