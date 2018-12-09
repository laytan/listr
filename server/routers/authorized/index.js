const express = require("express");
const middleware = require("../../middleware");
const router = express.Router();

const listRouter = require("./list-router");

router.use(middleware.isAuthorized);

router.get("/verify", (req, res, next) => {
  res.json({
    id: req.user.user_id,
    username: req.user.user_name
  });
});

router.use("/list", listRouter);

module.exports = router;
