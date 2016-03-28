# VBI

An interactive business intelligence tool


## Develop

First install the projects dependencies once:

```bash
$ npm install
```

Start the development server with hot reloading:

```bash
$ npm run dev-server
```

Open [http://localhost:3000](http://localhost:3000) in your browser.



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

### Create a heroku application

First install the [heroku toolbelt](https://toolbelt.heroku.com/).

To deploy to heroku, first set a git remote to your heroku application:

```bash
$ heroku git:remote -a vanpaz-business-intelligence
```


### Build

To generate a bundle with the client side code:

```bash
$ npm run build
```

This generates files in the folder `./dist`.


### Run server

To start the production server locally:

```bash
$ npm start
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

The production server can be started with a custom port number:

```bash
$ PORT=3001 npm start
```



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
