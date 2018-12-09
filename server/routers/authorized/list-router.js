const express = require("express");
const router = express.Router();

const list = require("../../tables/list");
const listitem = require("../../tables/listitem");
const db = require("../../database/connection");
const validation = require("../../validation");

function constructFullListsObject(lists, listItems, includeBoughtBy) {
  let toReturn = [];
  lists.forEach(list => {
    let listObj;
    if (list.user_name) {
      listObj = {
        list_id: list.list_id,
        title: list.list_title,
        description: list.list_description,
        user: {
          user_id: list.user_id,
          user_name: list.user_name,
          user_created: list.user_created
        },
        list_items: []
      };
    } else {
      listObj = {
        list_id: list.list_id,
        title: list.list_title,
        description: list.list_description,
        user_id: list.user_id,
        list_items: []
      };
    }
    //Creates a new array with all the items that belong to this list
    const thisListsItems = listItems.filter(
      item => item.list_id == list.list_id
    );

    thisListsItems.forEach(listitem => {
      const li = {
        list_item_id: listitem.list_item_id,
        list_item_text: listitem.list_item_text,
        is_bought: listitem.is_bought,
        list_id: listitem.list_id,
        user_id: listitem.user_id,
        bought_by: listitem.bought_by
      };
      /**
       * If this is the requesting users personal list
       * we don't want them to see bought_by in the client console
       */

      if (!includeBoughtBy) delete li.bought_by;
      //Add this item to the beginning of the items
      listObj.list_items.unshift(li);
    });
    //Add the list to the beginning of the final array with all the lists
    toReturn.unshift(listObj);
  });

  return toReturn;
}

//Gets all the users lists and list items
const getAll = async (req, res, next) => {
  //Gets all the lists and listitems from this user
  const userId = req.user.user_id;
  [lists, listItems] = await Promise.all([
    list.getByUserId(userId),
    listitem.getByUserId(userId)
  ]);
  const toReturn = constructFullListsObject(lists, listItems, false);

  res.json(toReturn);
};
router.get("/full", db.catchErrors(getAll));

//Removes a list and all it's items
const listRemove = async (req, res, next) => {
  console.log("Post request list remove");

  const user_id = req.user.user_id;
  const list_id = req.body.list_id;
  if (!list_id) {
    res.status(422);
    throw new Error("Invalid input");
  }

  //Runs the 2 promises together because they don't depend on eachother
  const [listRes, listItemRes] = await Promise.all([
    list.removeListById(list_id, user_id),
    listitem.removeAllListItemsByListId(list_id, user_id)
  ]);

  res.json({
    affectedRows: listRes + listItemRes,
    message: "succes"
  });
};
router.post("/remove", db.catchErrors(listRemove));

//Creates a list
const listCreate = async (req, res, next) => {
  console.log("Request on list create");
  //Extract needed properties
  const user_id = req.user.user_id;
  let { list_title, list_description } = req.body;
  //Validate list title
  const listValidation = validation.minMax(list_title, "List title", 1, 200);
  if (listValidation != true) {
    res.status(422);
    throw new Error(listValidation);
  }

  //List description can be empty, only validate when it has one
  if (list_description) {
    //Validate list description
    const descriptionValidation = validation.minMax(
      list_description,
      "List description",
      0,
      500
    );
    if (descriptionValidation != true) {
      res.status(422);
      throw new Error(descriptionValidation);
    }
  } else list_description = null;
  //Insert the list
  const insertId = await list.insert(list_title, list_description, user_id);
  //Get the inserted list
  const insertedList = await list.getById(insertId);
  //Return the inserted list
  res.json(insertedList);
};
router.post("/create", db.catchErrors(listCreate));

const all = async (req, res, next) => {
  console.log("reqeust on all");
  const user_id = req.user.user_id;
  const lists = await list.getByUserId(user_id);
  if (lists) res.json(lists);
  throw new Error("No lists");
};
router.get("/all", db.catchErrors(all));

const allWithAuthorization = async (req, res, next) => {
  console.log("Request on all with auth");
  const userToCheck = req.body.user_id;
  if (!userToCheck) throw new Error("No user given");

  [hasAuthorizationOver, allLists] = await Promise.all([
    list.allListsAuthorizedByUser(req.user.user_id, userToCheck),
    list.getByUserId(req.user.user_id)
  ]);

  //Remove everything in hasauth from all

  hasAuthorizationOver.forEach(list => {
    const authId = list.list_id;
    list.auth = true;
    for (let i = 0; i < allLists.length; i++) {
      if (authId == allLists[i].list_id) allLists.splice(i, 1);
    }
  });
  allLists.forEach(list => {
    list.auth = false;
  });
  const finalResult = hasAuthorizationOver.concat(allLists);
  console.log("Final: ", finalResult);
  res.json(finalResult);
};
router.post("/all-with-authorization", db.catchErrors(allWithAuthorization));

const authorize = async (req, res, next) => {
  let { list_id, user_id } = req.body;
  let author_id = req.user.user_id;

  if (!list_id || !user_id) throw new Error("Invalid request");
  list_id = parseInt(list_id);
  user_id = parseInt(user_id);
  if (!list_id || !user_id) throw new Error("Invalid request");

  const response = await list.authorizeUser(author_id, list_id, user_id);
  res.json({ insertId: response });
};
router.post("/authorize", db.catchErrors(authorize));

const unAuthorize = async (req, res, next) => {
  let { list_id, user_id } = req.body;
  let author_id = req.user.user_id;

  if (!list_id || !user_id) throw new Error("Invalid reqeust");
  list_id = parseInt(list_id);
  user_id = parseInt(user_id);
  if (!list_id || !user_id) throw new Error("Invalid request");

  const response = await list.unAuthorize(author_id, list_id, user_id);
  res.json(response);
};
router.post("/un-authorize", db.catchErrors(unAuthorize));

const timeline = async (req, res, next) => {
  console.log("Request on timeline");
  const user_id = req.user.user_id;
  [lists, listitems] = await Promise.all([
    list.getTimeline(user_id),
    listitem.getTimeline(user_id)
  ]);
  console.log("Lists: ", lists);
  console.log("listitems: ", listitems);
  const objectForTimeline = constructFullListsObject(lists, listitems, true);
  console.log(objectForTimeline);
  res.json(objectForTimeline);
};
router.get("/timeline", db.catchErrors(timeline));
/**
 * All listitem routes
 */

//Creates a listitem
const listItemCreate = async (req, res, next) => {
  //Get props
  const { list_item_text, list_id } = req.body;
  const userId = req.user.user_id;
  //Validate props
  const liTextValidation = validation.minMax(
    list_item_text,
    "List item text",
    1,
    250
  );
  if (liTextValidation != true) {
    res.status(422);
    throw new Error(liTextValidation);
  } else if (!list_id) {
    res.status(422);
    throw new Error("No list selected!");
  }

  const insertId = await listitem.insert(list_item_text, list_id, userId);
  const insertedItem = await listitem.getById(insertId);
  res.json(insertedItem);
};
router.post("/item/create", db.catchErrors(listItemCreate));

//Removes a list item by id and verifies that it is coming from the author
const listItemRemove = async (req, res, next) => {
  const user_id = req.user.user_id;
  const delete_id = req.body.list_item_id;
  if (!user_id || !delete_id) {
    res.status(422);
    throw new Error("No item selected!");
  }
  const affectedRows = await listitem.removeById(delete_id, user_id);
  res.json({ affectedRows: affectedRows, message: "succes" });
};
router.post("/item/remove", db.catchErrors(listItemRemove));

const bought = async (req, res, next) => {
  const user_id = req.user.user_id;
  const list_item_id = req.body.list_item_id;
  if (!list_item_id) throw new Error("No list specified");

  const response = await listitem.verifyAndSetBought(user_id, list_item_id);
  console.log(response);

  res.json({ affectedRows: response.affectedRows });
};
router.post("/item/bought", db.catchErrors(bought));

const unbuy = async (req, res, next) => {
  const user_id = req.user.user_id;
  const list_item_id = req.body.list_item_id;
  if (!list_item_id) throw new Error("No list specified");

  const response = await listitem.verifyAndSetUnBought(user_id, list_item_id);
  console.log(response);

  res.json({ affectedRows: response.affectedRows });
};
router.post("/item/unbuy", db.catchErrors(unbuy));

module.exports = router;
