# VBI

An interactive business intelligence tool


## Usage

```bash
$ npm install
```

Start the development server with hot reloading:

```bash
$ npm start
```

Or start the server at a custom port:

```bash
$ PORT=5000 npm start
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


## Deploy

To deploy to heroku, first set a git remote to your heroku application:

```bash
$ heroku git:remote -a vanpaz-business-intelligence
```

Then force Heroku to install all devDependencies, as it has to built the server application on startup:

```
$ heroku config:set NPM_CONFIG_PRODUCTION=false
```

To deploy:

```bash
$ git push heroku master
```


## Linting

This boilerplate project includes React-friendly ESLint configuration.

```
npm run lint
```

## License

MIT
