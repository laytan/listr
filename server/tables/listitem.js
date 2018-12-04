const db = require('../database/connection');

function create(req) {
    return new Promise((resolve, reject) => {
        //Get properties 
        let { list_item_text, list_id } = req.body;
        const user_id = req.user.user_id;

        //Validate properties
        if(!list_item_text || !list_id || !user_id) {
            const error = new Error("Not all fieds are filled in.");
            return reject(error);
        }
        list_item_text = list_item_text.toString().trim();
        if(list_item_text.length > 250) {
            const error = new Error("Text is too long.");
            return reject(error);
        }

        //Insert
        db.queryPromise('INSERT INTO list_item(list_item_text, list_id, user_id) VALUES(?,?,?);', [list_item_text, list_id, user_id])
        .then((response) => {
            list_item_id = response.insertId;
            //Select the inserted list
            return db.queryPromise('SELECT * FROM list_item WHERE list_item_id = ?', list_item_id);
        })
        .then((insertedListItem) => {
            return resolve(insertedListItem[0]);
        })
        .catch((err) => {
            console.log(err);
            const error = new Error(err);
            return reject(error);
        });
    });
}

module.exports = {
    create,
}