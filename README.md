# VBI

An interactive business intelligence tool


## Develop

For development, we will start two servers: the backend server serving a REST API to authentication and load/save documents in a database, and a front-end server which does do hot reloading of the front-end whilst working on the front-end code.

- First install the projects dependencies once:

  ```
  $ npm install
  ```

- Start the backend server and pass configuration (replace `###` with the actual variables):

  ```
  $ PORT=8080 SERVER_URL=http://localhost:8081 COUCH_DB=### GOOGLE_CLIENT_ID=### GOOGLE_CLIENT_SECRET=### FACEBOOK_APP_ID=### FACEBOOK_APP_SECRET=### DEBUG=vbi* node server
  ```

  The backend server will listen on port 8080 by default. The front-end development server has a proxy to the REST API of the backend server.

  > IMPORTANT: For development, the `SERVER_URL` should point to the url of the front-end development server to allow redirects to the front-end server after logging in. In production (deployed on Heroku), it should point to the public url of the server.

  > TIP: put all configuration in a bash script, in order not to have to enter all values every time again. Be careful though, don't commit this script to the public (!) github project, as it contains sensitive information.

- Start the front-end server with hot reloading. This server is purely for development.

  ```
  $ PORT=8081 BACKEND_SERVER_URL=http://localhost:8080 node dev-server
  ```

- Open [http://localhost:8081](http://localhost:8081) in your browser.



## Test

To run the tests, first install dependencies once:

```
$ npm install
```

Then run the tests:

```
$ npm test
```

To run a sanity check of the code:

```
npm run lint
```



## Deploy

### Prerequisites

- Install git, node.js, npm, and [heroku toolbelt](https://toolbelt.heroku.com/) on your system.

### Hosting, databases, configuration

1. Create a Heroku application to host the application server in the cloud:

  ```
  $ heroku git:remote -a vanpaz-business-intelligence
  ```

  Configure the url of the server itself:

  ```
  $ heroku config:set SERVER_URL=https://vanpaz-business-intelligence.herokuapp.com
  ```

  Also turn on debugging output:

  ```
  $ heroku config:set DEBUG=vbi*
  ```

2. Create a Couch database at [cloudant](https://cloudant.com). CouchDB is used to store the scenarios that users have created. Configure the url in the Heroku application like:

  ```
  $ heroku config:set COUCH_DB=https://username:password@username.cloudant.com
  ```

3. Create a Redis database used to store session information of logged in users.

  ```
  $ heroku addons:create rediscloud
  ```

4. Register the application in the [Google Developer Console](https://console.developers.google.com), to authenticate users with their Google account. Configure the application to use the Google+ API, and under "API Manager", "Credentials", create an Oauth client configured with the following redirect URIs:

  ```
  http://localhost:8080/api/v1/auth/google/callback
  https://vanpaz-business-intelligence.herokuapp.com/api/v1/auth/google/callback
  ```

  Configure the heroku application with the google client id and client secret:

  ```
  $ heroku config:set GOOGLE_CLIENT_ID=1234567890.apps.googleusercontent.com
  $ heroku config:set GOOGLE_CLIENT_SECRET=ABCDEFG
  ```

5. Register the application at [Facebook for developers](https://developers.facebook.com), to authenticate users with their Facebook account. Configure Oauth under "settings", "advanced", add the following redirect URIs:

  ```
  http://localhost:8080/api/v1/auth/facebook/callback
  https://vanpaz-business-intelligence.herokuapp.com/api/v1/auth/facebook/callback
  ```
  Copy the app id and app secret from the front page of the developer dashboard, and add them to the configuration of the Heroku application:

  ```
  $ heroku config:set FACEBOOK_APP_ID=1234567890
  $ heroku config:set FACEBOOK_APP_SECRET=ABCDEFG
  ```


### Build

To generate a bundle with the client side code:

```
$ npm run build
```

This generates files in the folder `./dist`.


### Run server

To start the backend server locally, specify config variables on the command line and run `node server` (replace `###` with the actual variables):

```
$ PORT=8080 SERVER_URL=http://localhost:8080 COUCH_DB=### GOOGLE_CLIENT_ID=### GOOGLE_CLIENT_SECRET=### FACEBOOK_APP_ID=### FACEBOOK_APP_SECRET=### DEBUG=vbi* node server
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.



### Deploy to Heroku

To deploy, run the following script:

```
$ npm run deploy
```

This will run the build script to generate the files under `./dist`, commit the changes to git, and push the project to Heroku.

To see the logs of heroku, run:

```
$ heroku logs --tail
```

## API

### Rest API


```
# authentication
GET /api/v1/auth/google/signin?redirectTo=url

    Sign in with a Google account. Will redirect to a Google sign in page.
    Redirect url is an optional query parameter.

GET /api/v1/auth/facebook/signin?redirectTo=url

    Sign in with a Google account. Will redirect to a Google sign in page.
    Redirect url is an optional query parameter.

GET /api/v1/auth/signout

    Sign out from either Google or Facebook.

# user
GET /api/v1/user

    Get the current user profile.
    Returns an empty object when not logged in.

# documents
GET     /api/v1/docs           List all documents
GET     /api/v1/docs/:id       Load a saved sheet
POST    /api/v1/docs/:id       Save a new sheet
PUT     /api/v1/docs/:id       Update an existing sheet
DELETE  /api/v1/docs/:id/:rev  Delete a document
```


### Document formats

A saved scenario has the following structure:

```js
{
  "title": "",
  "data": {
    "parameters": {
      // ...
    },
    "costs": {
      "direct": [
        {
          "id": "<uuid>",
          "name": "<category name>",
          "price": { ... },
          "quantities": {
             "<YEAR>": "<AMOUNT>",
             ...
          }
        },
        ...
      ],
      "personnel": [...],
      "indirect": [...]
    }
    "investments": {
      "tangible": [...],
      "intangible": [...]
    }
    "revenues": {
      "all": [...]
    },
    "financing": {
      "investmentsInParticipations": {
        "<YEAR>": "<AMOUNT>",
        ...
      },
      "equityContributions": { ... },
      "bankLoansCapitalCalls": { ... },
      "bankLoansRedemptionInstallments": { ... },
      "otherSourcesOfFinance": { ... }
    },
    "initialBalance": {
      // ...
    }
  },
  "auth": {
    "<user id>": "role",
    "*": "role",   // anybody
    // ...
  },
  "updated": "ISODate"
}
```

The `data` contains three main sections: `costs`, `investments`, `revenues`, and a section `parameters` holding generic parameters. Each section contains groups, and every group contains a list with categories. Each category describes a name, price, and category. Additionally, the `data` contains
an object `financing` where financing can be specified per year and category,
and an object `initialBalance` where all properties for the initial balance
can be entered. The latter is optional and only applicable for running businesses.

The following roles are available:

- `owner` Can read, write, delete, and manage authorized users.
- `write` Can read and write.
- `read` Can read only.

A user profile is structured like follows:

```js
// Google account
{
  "provider": "google",
  "id": "google:johndoe@gmail.com",
  "displayName": "John Doe",
  "email": "johndoe@gmail.com",
  "photo": "http://some_url.png"
}

// Facebook account
{
  "provider": "facebook",
  "id": "facebook:01234567890",
  "displayName": "John Doe",
  "email": null,
  "photo": "http://some_url.png"
}
```

### Price formats

The application supports multiple types of prices:

- initial price, constant change per period

  ```js
  {
    "type": "constant",
    "value": "28k",  // initial price
    "change": "+3%"  // change per period
  }
  ```

- manually entered price per period (2015, 2016, 2017)

  ```js
  {
    "type": "manual",
    "values": {
      "2015": "28k",
      "2016": "29k",
      "2017": "33k",
      "2018": "34k"
    }
  }
  ```

- a percentage of the revenue:

  ```js
  {
    "type": "revenue",
    "percentage": "+3%"
  }
  ```

- an investment

  ```js
  {
    "type": "investment",
    "value": "100",
    "depreciationPeriod": "5"
  }
  ```

- a salary

  ```js
  {
    "type": "salary",
    "value": "50k",    // monthly salary
    "change": "+2%"    // yearly increase in salary
  }
  ```


## Literature

- [Fundamental Analysis](http://zerodha.com/varsity/module/fundamental-analysis/) (book)


## License

MIT
