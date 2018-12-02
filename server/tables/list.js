const db = require('../database/connection');

function create(req) {
    return new Promise ((resolve, reject) => {
        const user_id = req.user.user_id;
        let { list_title, list_description } = req.body;
        
        if(!list_title) return reject( new Error("No title given"));
        list_title = list_title.toString().trim();
        if(list_title.length > 50 || list_title.length < 1) {
            console.log("title length not valid");
            throw new Error("Title length is not valid");
        }
        
        if(!list_description) list_description = '';
        else {
            list_description = list_description.toString().trim();
            if(list_description.length > 300) {
                console.log('description is to long');
                throw new Error("Description is to long");
            }
        }

        queryPromise('INSERT INTO list(list_title, list_description, user_id) VALUES(?,?,?);',
        [list_title, list_description, user_id])
        .then((result) => {
            return queryPromise('SELECT * FROM list WHERE list_id = ? AND user_id = ?', [result.insertId, user_id]);
        })
        .then((insertedList) => {
            return resolve(insertedList[0]);
        })
        .catch((error) => {
            console.log(error);
            throw new Error(error);
        });
    });
}

function remove(req) {
   
    return new Promise((resolve, reject) => {
        const user_id = req.user.user_id;
        let list_id = req.body.list_id;
        if(!list_id) throw new Error("Invalid input");
        
        queryPromise('DELETE FROM list WHERE user_id = ? AND list_id = ?', [user_id, list_id])
        .then(() => {
            return queryPromise('DELETE FROM list_item WHERE list_id = ? AND user_id = ?', [list_id, user_id])
        })
        .then(() => {
            return resolve({"deleteId": list_id});
        })
        .catch((err) => {
            return reject(err);
        });
    });
}

function getAll(req) {
    return new Promise((resolve, reject) => {
        const id = req.user.user_id;
        let finalObj = [];
        let lists;
        queryPromise('SELECT * FROM list WHERE user_id = ?', id)
        .then((res) => {
            lists = res;
            return queryPromise('SELECT * FROM list_item WHERE user_id = ?', id);
        })
        .then((list_items) => {
            lists.forEach(list => {
                let l = {
                    list_id: list.list_id,
                    title: list.list_title,
                    description: list.list_description,
                    items: [],
                }
                list_items.forEach(item => {
                    if(item.list_id != list.list_id) return;
                    let li = {
                        list_item_id: item.list_item_id,
                        list_item_text: item.list_item_text,
                        list_id: item.list_id,
                        user_id: item.user_id,
                    }
                    l.items.unshift(li);
                });
                finalObj.push(l);
            });
            
            return resolve(finalObj.reverse());
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