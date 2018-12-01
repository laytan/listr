const db = require('./connection');

function create(body) {
    return new Promise ( async (resolve, reject) => {

    });
}

function remove(req) {
   
    return new Promise((resolve, reject) => {
        const user_id = req.user.user_id;
        let list_id = req.body.list_id;
        if(!list_id) throw new Error("Invalid input");
        
        queryPromise('DELETE FROM list WHERE user_id = ? AND list_id = ?', [user_id, list_id])
        .then((res) => {
            console.log(res);
            return resolve(res);
        })
        .catch((err) => {
            return reject(err);
        });
    });
}

function getAll(req) {
    return new Promise((resolve, reject) => {
        const id = req.user.user_id;
        let finalObj = {};
        let lists;
        queryPromise('SELECT * FROM list WHERE user_id = ?', id)
        .then((res) => {
            lists = res;
            return queryPromise('SELECT * FROM list_item WHERE user_id = ?', id);
        })
        .then((list_items) => {
            lists.forEach(list => {
                finalObj[list.list_id] = {
                    list_id: list.list_id,
                    title: list.list_title,
                    description: list.list_description,
                    items: {

                    }
                }
                list_items.forEach(item => {
                    if(item.list_id != list.list_id) return;
                    finalObj[list.list_id].items[item.list_item_id] = {
                        id: item.list_item_id,
                        text: item.list_item_text,
                        list_id: item.list_id,
                    }
                });
            });
            return resolve(finalObj);
        })
        .catch((err) => {
            console.log(err);
            return reject(new Error("Internal server error"));
        });
        
    });
}

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
    getAll,
    remove,
}