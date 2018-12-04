# Routes

## GET

### Verify

``/authorized/verify``

#### Parameters

Authentication header with a JSON webtoken

#### Valid request returns

1. ``user_id``
2. ``user_name``

### Full

``/authorized/list/full``

#### Parameters

Authentication header with a JSON webtoken

#### Valid request returns

An Array of all lists that belong to the webtokens user with it's items.

```javascript
[
    1: {
        list_id: 1,
        title: "Lorem ipsum",
        description: "Dolor sit",
        user_id: 1,
        list_items: [
            1: {
                list_item_id: 1,
                list_item_text: "Lorem ipsum dolor sit",
                list_id: 1,
                user_id: 1,
            }
        ]
    }
    2: {
        //Etc...
    }
]
```

## POST

### Signup

``/user/signup``

#### Parameters

1. ``user_name``
2. ``user_password``

#### Valid request returns

1. JSON web token
2. succes message

### Login

``/user/login``

#### Parameters

1. ``user_name``
2. ``user_password``

#### Valid request returns

1. JSON web token
2. succes message

### List create

``/authorized/list/create``

#### Parameters

1. Authorization header with JSON web token
2. List title
3. List description

#### Valid request returns

The id of the inserted list

### List item create

``/authorized/list/item/create``

#### Parameters

1. Authorization header with JSON web token
2. List item title
3. List id

#### Valid request returns

The inserted item

#### List remove

``/authorized/list/remove``

#### Parameters

1. Authorization header with JSON web token
2. List id

#### Valid request returns

The id of the deleted list
