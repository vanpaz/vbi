# VBI

An interactive business intelligence tool


## Develop

First install the projects dependencies once:

```bash
$ npm install
```

Start the backend server and pass configuration:

```
$ PORT=8080 SERVER_URL=http://localhost:8081 COUCH_DB=### GOOGLE_CLIENT_ID=### GOOGLE_CLIENT_SECRET=### FACEBOOK_APP_ID=### FACEBOOK_APP_SECRET=### DEBUG=vbi* node server
```

The backend server will listen on port 8080 by default. The front-end development server has a proxy to the REST API of the backend server.

> IMPORTANT: For development, the `SERVER_URL` should point to the url of the front-end development server to allow redirects to the front-end server after logging in. In production (deployed on Heroku), it should point to the public url of the server.

Start the (front-end) development server with hot reloading:

```bash
$ PORT=8081 BACKEND_SERVER_URL=http://localhost:8080 node dev-server
```

Open [http://localhost:8081](http://localhost:8081) in your browser.

> TIP: put all configuration to start the servers in two bash scripts, in order not to have to repeat entering all values every time again. Be careful though, don't commit this script to the public (!) github project, as it contains sensitive information.

## Test

To run the tests, first install dependencies once:

```bash
$ npm install
```

Then run the tests:

```bash
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

  ```bash
  $ heroku git:remote -a vanpaz-business-intelligence
  ```

  Configure the url of the server itself:

  ```bash
  $ heroku config:set SERVER_URL=https://vanpaz-business-intelligence.herokuapp.com
  ```

  Also turn on debugging output:

  ```bash
  $ heroku config:set DEBUG=vbi*
  ```

2. Create a Couch database at [cloudant](https://cloudant.com). CouchDB is used to store the scenarios that users have created. Configure the url in the Heroku application like:

  ```bash
  $ heroku config:set COUCH_DB=https://username:password@username.cloudant.com
  ```

3. Create a Redis database used to store session information of logged in users.

  ```bash
  $ heroku addons:create rediscloud
  ```

4. Register the application in the [Google Developer Console](https://console.developers.google.com), to authenticate users with their Google account. Configure the application to use the Google+ API, and under "API Manager", "Credentials", create an Oauth client configured with the following redirect URIs:

  ```
  http://localhost:8080/api/v1/auth/google/callback
  https://vanpaz-business-intelligence.herokuapp.com/api/v1/auth/google/callback
  ```

  Configure the heroku application with the google client id and client secret:

  ```bash
  $ heroku config:set GOOGLE_CLIENT_ID=1234567890.apps.googleusercontent.com
  $ heroku config:set GOOGLE_CLIENT_SECRET=ABCDEFG
  ```

5. Register the application at [Facebook for developers](https://developers.facebook.com), to authenticate users with their Facebook account. Configure Oauth under "settings", "advanced", add the following redirect URIs:

  ```
  http://localhost:8080/api/v1/auth/facebook/callback
  https://vanpaz-business-intelligence.herokuapp.com/api/v1/auth/facebook/callback
  ```
  Copy the app id and app secret from the front page of the developer dashboard, and add them to the configuration of the Heroku application:

  ```bash
  $ heroku config:set FACEBOOK_APP_ID=1234567890
  $ heroku config:set FACEBOOK_APP_SECRET=ABCDEFG
  ```


### Build

To generate a bundle with the client side code:

```bash
$ npm run build
```

This generates files in the folder `./dist`.


### Run server

To start the production server locally, specify config variables on the command line and run `node server`:

```bash
$ PORT=8080 SERVER_URL=http://localhost:8080 COUCH_DB=### GOOGLE_CLIENT_ID=### GOOGLE_CLIENT_SECRET=### FACEBOOK_APP_ID=### FACEBOOK_APP_SECRET=### DEBUG=vbi* node server
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.



### Deploy to Heroku

To deploy, run the following script:

```bash
$ npm run deploy
```

This will run the build script to generate the files under `./dist`, commit the changes to git, and push the project to Heroku.

To see the logs of heroku, run:

```bash
$ heroku logs --tail
```


## License

MIT
