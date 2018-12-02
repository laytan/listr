const express = require('express');
const router = express.Router();

const listitem = require('../../tables/listitem');

router.post('/create', (req, res) => {
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