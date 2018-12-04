const db = require('../database/connection');

//Deletes all list items that are a part of the list with list_id
function removeAllListItemsByListId(list_id, user_id) {
    return new Promise((resolve,reject) => {
        db.queryPromise('DELETE FROM list_item WHERE list_id = ? AND user_id = ?', [list_id, user_id])
        .then((res) => {
            return resolve(res.affectedRows);
        })
        .catch((err) => {
            return reject(err);
        });
    });
}

//Gets all the listitems that belong to the user
function getByUserId(userId) {
    return new Promise((resolve, reject) => {
        db.queryPromise('SELECT * FROM list_item WHERE user_id = ?', userId)
        .then((res) => {
            return resolve(res);
        })
        .catch((err) => {
            return reject(err);
        });
    });
}

function insert(text, list, user) {
    return new Promise((resolve, reject) => {
        db.queryPromise('INSERT INTO list_item(list_item_text, list_id, user_id) VALUES(?,?,?)', [text, list, user])
        .then((res) => {
            return resolve(res.insertId);
        })
        .catch((err) => {
            return reject(err);
        })
    });
}

function getById(id) {
    return new Promise((resolve, reject) => {
        db.queryPromise('SELECT * FROM list_item WHERE list_item_id = ?', id)
        .then((res) => {
            return resolve(res[0]);
        })
        .catch((err) => {
            return reject(err);
        });
    });
}

module.exports = {
    removeAllListItemsByListId,
    getByUserId,
    insert,
    getById
}