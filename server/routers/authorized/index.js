const express = require('express');
const middleware = require('../../middleware');
const router = express.Router();

const listRouter = require('./list-router');
const listItemRouter = require('./list-item-router');

router.use(middleware.isAuthorized);

router.get('/verify', (req, res, next) => {
    res.json({
        id: req.user.user_id,
        username: req.user.user_name,
    });
});

router.use('/list', listRouter);
router.use('/listitem', listItemRouter);

module.exports = router;