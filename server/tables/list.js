const db = require("../database/connection");

//Inserts a new list
function insert(title, description, userId) {
  return new Promise((resolve, reject) => {
    db.queryPromise(
      "INSERT INTO list(list_title, list_description, user_id) VALUES(?,?,?);",
      [title, description, userId]
    )
      .then(res => {
        return resolve(res.insertId);
      })
      .catch(err => {
        return reject(err);
      });
  });
}

//Gets a list by it's id
function getById(list) {
  return new Promise((resolve, reject) => {
    db.queryPromise("SELECT * FROM list WHERE list_id = ?", list)
      .then(res => {
        return resolve(res[0]);
      })
      .catch(err => {
        return reject(err);
      });
  });
}

//Gets all the lists that belong to the user
function getByUserId(userId) {
  return new Promise((resolve, reject) => {
    db.queryPromise("SELECT * FROM list WHERE user_id = ?", userId)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function allListsAuthorizedByUser(user_id, userToCheck) {
  return new Promise((resolve, reject) => {
    db.queryPromise(
      "SELECT DISTINCT list.list_id, list.list_title, list.list_description FROM list INNER JOIN authorization ON list.list_id = authorization.list_id WHERE authorization.user_id = ? AND list.user_id = ?;",
      [userToCheck, user_id]
    )
      .then(response => resolve(response))
      .catch(err => reject(err));
  });
}

//Removes a list by id and verifies that it is from the user trying to delete it
function removeListById(list_id, user_id) {
  return new Promise((resolve, reject) => {
    db.queryPromise("DELETE FROM list WHERE list_id = ? AND user_id = ?", [
      list_id,
      user_id
    ])
      .then(res => {
        return resolve(res.affectedRows);
      })
      .catch(err => {
        return reject(err);
      });
  });
}

//Verifies the list belongs to author, then inserts an authorization row
function authorizeUser(author_id, list_id, userToAuthorize_id) {
  return new Promise((resolve, reject) => {
    db.queryPromise("SELECT * FROM list WHERE user_id = ? AND list_id = ?", [
      author_id,
      list_id
    ])
      .then(res => {
        if (res.length < 1) throw new Error("User does not own this list.");
        return db.queryPromise(
          "INSERT INTO authorization(user_id, list_id, created_at) VALUES(?,?,?);",
          [userToAuthorize_id, list_id, new Date().getTime()]
        );
      })
      .then(inserted => {
        return resolve(inserted.insertId);
      })
      .catch(err => {
        return reject(err);
      });
  });
}

function unAuthorize(author_id, list_id, userToAuthorize_id) {
  return new Promise((resolve, reject) => {
    db.queryPromise("SELECT * FROM list WHERE user_id = ? AND list_id = ?", [
      author_id,
      list_id
    ])
      .then(res => {
        if (res.length < 1) throw new Error("User does not own this list.");
        return db.queryPromise(
          "DELETE FROM authorization WHERE list_id = ? AND user_id = ?",
          [list_id, userToAuthorize_id]
        );
      })
      .then(deleted => {
        return resolve(deleted);
      })
      .catch(err => reject(err));
  });
}

function getTimeline(from) {
  return new Promise((resolve, reject) => {
    db.queryPromise(
      "SELECT list.*, user.* FROM authorization INNER JOIN list ON list.list_id = authorization.list_id INNER JOIN user ON list.user_id = user.user_id WHERE authorization.user_id = ?",
      from
    )
      .then(lists => {
        if (lists.length < 1) return reject(new Error("No lists found"));
        return resolve(lists);
      })
      .catch(err => reject(err));
  });
}

module.exports = {
  removeListById,
  insert,
  getById,
  getByUserId,
  authorizeUser,
  getTimeline,
  allListsAuthorizedByUser,
  unAuthorize
};
