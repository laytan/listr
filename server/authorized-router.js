const express = require('express');
const middleware = require('./middleware');
const list = require('./database/list');
const listitem = require('./database/listitem');
const router = express.Router();

router.use(middleware.isAuthorized);

router.get('/lists/full', (req, res) => {
    console.log("Get request on /authorized/lists/full");
    list.getAll(req)
    .then( (lists) => {
        res.json(lists);
    })
    .catch((err) => {
        console.log(err);
        res.status(500);
        res.json({"error": "Internal server error"});
    });
});

router.get('/verify', (req, res) => {
    console.log("get request on /authorized/verify");
    if(req.user) {
        res.json({
            id: req.user.user_id,
            username: req.user.user_name,
        });
    }
    else {
        res.status(501);
        res.json({"error": "Unauthorized request"});
    }
});

router.post('/lists/remove', (req, res) => {
    console.log("Post request on /authorized/lists/remove");
    list.remove(req)
    .then((result) => {
        res.json(result);
    })
    .catch((error) => {
        console.log(error);
        res.status(501);
        res.json(error);
    });
});

router.post('/lists/create', (req, res) => {
    console.log("Post request on /authorized/lists/create");
    list.create(req)
    .then((result) => {
        console.log(result);
        res.json(result);
    })
    .catch((error) => {
        console.log(error);
        res.status(422);
        res.json(error);
    });
});

router.post('/listitems/create', (req, res) => {
    console.log("Post request on /authorized/lists/create");
    listitem.create(req)
    .then((result) => {
        res.json(result);
    })
    .catch((error) => {
        console.log(error);
        res.status(422);
        res.json(error);
    });
});

module.exports = router;