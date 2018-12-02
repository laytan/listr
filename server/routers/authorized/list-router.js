const express = require('express');
const router = express.Router();

const list = require('../../tables/list');

router.get('/full', (req, res) => {
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

router.post('/remove', (req, res) => {
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

router.post('/create', (req, res) => {
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

module.exports = router;