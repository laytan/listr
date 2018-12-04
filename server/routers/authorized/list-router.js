const express = require('express');
const router = express.Router();

const list = require('../../tables/list');
const listitem = require('../../tables/listitem');
const db = require('../../database/connection');
const validation = require('../../validation');


//Gets all the users lists and list items
const getAll = async (req, res, next) => {
    //Gets all the lists and listitems from this user
    const userId = req.user.user_id;
    [lists, listItems] = await Promise.all([list.getByUserId(userId), listitem.getByUserId(userId)]);
    
    let toReturn = [];
    lists.forEach(list => {
        let listObj = {
            list_id: list.list_id,
            title: list.list_title,
            description: list.list_description,
            user_id: list.user_id,
            list_items: [],
        }
        //Creates a new array with all the items that belong to this list
        const thisListsItems = 
        listItems.filter(item => item.list_id == list.list_id);
        
        thisListsItems.forEach(listitem => {
            const li = {
                list_item_id: listitem.list_item_id,
                list_item_text: listitem.list_item_text,
                list_id: listitem.list_id,
                user_id: listitem.user_id,
            }
            //Add this item to the beginning of the items
            listObj.list_items.unshift(li);
        });
        //Add the list to the beginning of the final array with all the lists
        toReturn.unshift(listObj);
    });
    res.json(toReturn);
}
router.get('/full', db.catchErrors(getAll));

//Removes a list and all it's items
const listRemove = async (req, res, next) => {
    console.log("Post request list remove");

    const user_id = req.user.user_id;
    const list_id = req.body.list_id;
    if(!list_id) {
        res.status(422);
        throw new Error("Invalid input");
    }

    //Runs the 2 promises together because they don't depend on eachother
    const [listRes, listItemRes] = 
    await Promise.all([
        list.removeListById(list_id, user_id), 
        listitem.removeAllListItemsByListId(list_id, user_id)
    ]);

    res.json({
        "affectedRows": listRes + listItemRes,
        "message": "succes",
    });
}
router.post('/remove', db.catchErrors(listRemove));

//Creates a list
const listCreate = async (req, res, next) => {
    console.log("Request on list create");
    //Extract needed properties
    const user_id = req.user.user_id;
    const { list_title, list_description } = req.body;
    //Validate list title
    const listValidation = validation.minMax(list_title, "List title", 1, 200);
    if(listValidation != true) {
        res.status(422);
        throw new Error(listValidation);
    }

    //List description can be empty, only validate when it has one
    if(list_description) {
        //Validate list description
        const descriptionValidation = validation.minMax(list_description, "List description", 0, 500);
        if(descriptionValidation != true) {
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
}
router.post('/create', db.catchErrors(listCreate));

/**
 * All listitem routes
 */

//Creates a listitem
const listItemCreate = async (req, res, next) => {
    //Get props
    const { list_item_text, list_id } = req.body;
    const userId = req.user.user_id;
    //Validate props
    const liTextValidation = validation.minMax(list_item_text, "List item text", 1, 250);
    if(liTextValidation != true) {
        res.status(422);
        throw new Error(liTextValidation);
    }
    else if(!list_id) {
        res.status(422);
        throw new Error("No list selected!");
    }

    const insertId = await listitem.insert(list_item_text, list_id, userId);
    const insertedItem = await listitem.getById(insertId);
    res.json(insertedItem);
}
router.post('/item/create', db.catchErrors(listItemCreate));

module.exports = router;