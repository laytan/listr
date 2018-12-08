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

function removeById(id, user_id) {
    return new Promise((resolve, reject) => {
        db.queryPromise('DELETE FROM list_item WHERE user_id = ? AND list_item_id = ?', [user_id, id])
        .then((res) => {
            return resolve(res.affectedRows);
        })
        .catch((err) => {
            return reject(err);
        });
    });
}

function getTimeline(from) {
    return new Promise((resolve, reject) => {
        db.queryPromise('SELECT list_item.* FROM authorization INNER JOIN list ON authorization.list_id = list.list_id INNER JOIN list_item ON list_item.list_id = list.list_id WHERE authorization.user_id = ?', from)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
}

function verifyAndSetBought(user_id, list_item_id) {
    return new Promise((resolve, reject) => {
        db.queryPromise('SELECT * FROM authorization WHERE authorization.user_id = ? AND authorization.list_id = (SELECT list_item.list_id FROM list_item WHERE list_item.list_item_id = ?)', [user_id, list_item_id])
        .then(response => {
            console.log(response);
            if(response.length > 0) return db.queryPromise('UPDATE list_item SET is_bought = 1, bought_by = ? WHERE list_item_id = ?', [user_id, list_item_id]);
            else return reject(new Error("Not authorized to buy this item"));
        })
        .then(updateResult => {
            return resolve(updateResult);
        })
        .catch(err => {
            return reject(err);
        });
    });
}

function verifyAndSetUnBought(user_id, list_item_id) {
    return new Promise((resolve, reject) => {
        db.queryPromise('SELECT * FROM authorization WHERE authorization.user_id = ? AND authorization.list_id = (SELECT list_item.list_id FROM list_item WHERE list_item.list_item_id = ?)', [user_id, list_item_id])
        .then(response => {
            console.log(response);
            if(response.length > 0) return db.queryPromise('UPDATE list_item SET is_bought = 0, bought_by = NULL WHERE list_item_id = ?', list_item_id);
            else return reject(new Error("Not authorized to unBuy this item"));
        })
        .then(updateResult => {
            return resolve(updateResult);
        })
        .catch(err => {
            return reject(err);
        });
    });
}

module.exports = {
    removeAllListItemsByListId,
    getByUserId,
    insert,
    getById,
    removeById,
    getTimeline,
    verifyAndSetBought,
    verifyAndSetUnBought
}