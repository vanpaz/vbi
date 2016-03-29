# REST API

<!-- TODO: document authentication methods -->

```
GET     /api/v1/docs           List all documents of the user
GET     /api/v1/docs/:id       Load a saved sheet
POST    /api/v1/docs/:id       Save a new sheet
PUT     /api/v1/docs/:id       Update an existing sheet
DELETE  /api/v1/docs/:id/:rev  Delete a document
```

Document format:

```js
{
  "title": "",
  "data": {
    costs: {},
    revenues: {}
  },
  "auth": {
    "userId": "role",
    "*": "role",   // anybody
    // ...
  },
  "updated": "ISODate"
}
```

The following roles are available:

- `owner` Can read, write, delete, and manage authorized users.
- `write` Can read and write.
- `read` Can read only.
