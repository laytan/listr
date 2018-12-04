const db = require('../database/connection');

//Inserts a new list
function insert(title, description, userId) {
    return new Promise((resolve, reject) => {
        db.queryPromise('INSERT INTO list(list_title, list_description, user_id) VALUES(?,?,?);',
            [title, description, userId])
        .then((res) => {
            return resolve(res.insertId);
        })
        .catch((err) => {
            return reject(err);
        });
    });
}

//Gets a list by it's id
function getById(list) {
    return new Promise((resolve, reject) => {
        db.queryPromise('SELECT * FROM list WHERE list_id = ?', list)
        .then((res) => {
            return resolve(res[0]);
        })
        .catch((err) => {
            return reject(err);
        });
    });
}

//Gets all the lists that belong to the user
function getByUserId(userId) {
    return new Promise((resolve, reject) => {
        db.queryPromise('SELECT * FROM list WHERE user_id = ?', userId)
        .then((res) => {
            resolve(res);
        })
        .catch((err) => {
            reject(err);
        });
    });
}

//Removes a list by id and verifies that it is from the user trying to delete it
function removeListById(list_id, user_id) {
    return new Promise((resolve, reject) => {
        db.queryPromise('DELETE FROM list WHERE list_id = ? AND user_id = ?', [list_id, user_id])
        .then((res) => {
            return resolve(res.affectedRows);
        })
        .catch((err) => {
            return reject(err);
        });
    });
}

module.exports = {
    removeListById,
    insert,
    getById,
    getByUserId
}