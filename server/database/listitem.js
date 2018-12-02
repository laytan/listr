const db = require('./connection');

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
        queryPromise('INSERT INTO list_item(list_item_text, list_id, user_id) VALUES(?,?,?);', [list_item_text, list_id, user_id])
        .then((response) => {
            list_item_id = response.insertId;
            //Select the inserted list
            return queryPromise('SELECT * FROM list_item WHERE list_item_id = ?', list_item_id);
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

/**
 * Function: queryPromise
 * 
 * Turns a database query, which is callback based. Into a promise, results in cleaner code
 * everywhere else.
 * 
 * @param {String} sql The query to be used
 * @param {Array} args The values to be set at the ?'s in the sql
 * @returns {Promise} Rejects with an error from the database
 *                    or resolves with an array of the database results
 */
function queryPromise(sql, args) {
    return new Promise((resolve, reject) => {
        db.mysqlConnection.query(sql, args, (err, res, fields) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(res);
            }
        });
    });
}

module.exports = {
    create,
}