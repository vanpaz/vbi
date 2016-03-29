var request = require('request');
var express = require('express');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var compression = require('compression');
var bodyParser  = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var debug = require('debug')('vbi:server');
var getFriendlyId = require('./src/server/friendlyId').getFriendlyId;

var PORT                  = process.env.PORT || 8080;
var COUCH_DB              = process.env.COUCH_DB || 'http://localhost:5984';
var DB_NAME               = process.env.DB_NAME || 'vbi';
var GOOGLE_CLIENT_ID      = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET  = process.env.GOOGLE_CLIENT_SECRET;
var FACEBOOK_APP_ID       = process.env.FACEBOOK_APP_ID;
var FACEBOOK_APP_SECRET   = process.env.FACEBOOK_APP_SECRET;
var REDISCLOUD_URL        = process.env.REDISCLOUD_URL;
var SERVER_URL            = process.env.SERVER_URL;

var ORIGINS = [
  'http://localhost:8080',
  'https://vanpaz-business-intelligence.herokuapp.com'
];

// validate required environment variables
if (!SERVER_URL) {
  console.error('Error: Environment variable SERVER_URL undefined');
  process.exit();
}
if (!GOOGLE_CLIENT_ID) {
  console.error('Error: Environment variable GOOGLE_CLIENT_ID undefined');
  process.exit();
}
if (!GOOGLE_CLIENT_SECRET) {
  console.error('Error: Environment variable GOOGLE_CLIENT_SECRET undefined');
  process.exit();
}
if (!FACEBOOK_APP_ID) {
  console.error('Error: Environment variable FACEBOOK_APP_ID undefined');
  process.exit();
}
if (!FACEBOOK_APP_SECRET) {
  console.error('Error: Environment variable FACEBOOK_APP_SECRET undefined');
  process.exit();
}

// output some of the variables
console.log('COUCH_DB=' + COUCH_DB);
console.log('DB_NAME=' + DB_NAME);
console.log('SERVER_URL=' + SERVER_URL);


var nano = require('nano')(COUCH_DB);
var db = nano.use(DB_NAME);
init_db();

var app = express();

// serve static files from dist folder.
// should be generated beforehand by running `npm run build`
app.use(express.static('dist'));

app.use(compression());    // enable compression
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({
  store: (REDISCLOUD_URL ? new RedisStore({ url: REDISCLOUD_URL }) : null),
  secret: 'youre not going to guess this one',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());

app.listen(PORT);
console.log('Server listening at http://localhost:' + PORT);

// TODO: how do I want to serialize users?
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

/**
 * Callback function for all authentication strategies.
 * Adds the authentication tokens as an object `auth` to the profile.
 * @param accessToken
 * @param refreshToken
 * @param params
 * @param profile
 * @param done
 * @return {*}
 */
function onAuth (accessToken, refreshToken, params, profile, done) {
  profile.auth = {
    accessToken: accessToken,
    refreshToken: refreshToken,
    params: params
  };
  return done(null, profile);
}

// Setup passport server for google authentication
passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: SERVER_URL + '/api/v1/auth/google/callback',
      scope: ['email']
    },
    onAuth
));

// Setup passport server for facebook authentication
passport.use(new FacebookStrategy({
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: SERVER_URL + '/api/v1/auth/facebook/callback',
      scope: ['email', 'public_profile']
    },
    onAuth
));

/**
 * Apply CORS
 */
app.all('*', function(req, res, next) {
  var origin = req.headers.origin;
  if (origin && ORIGINS.indexOf(origin.toLowerCase()) != -1) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  }

  if (req.method.toUpperCase() === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

/**
 * Start login with google, will bring the user to the login page of google
 */
app.get('/api/v1/auth/google',
    passport.authenticate('google', {
      session: false,
      accessType: 'online',
      approvalPrompt: 'auto' // 'auto' (default) or 'force'
    }));

/**
 * Start login with facebook, will bring the user to the login page of facebook
 */
app.get('/api/v1/auth/facebook', passport.authenticate('facebook'));

/**
 * Google login callback
 */
app.get('/api/v1/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/' }),
    function(req, res) {
      // copy needed fields to the session object
      var email = req.user.emails[0].value;
      var expires_in = req.user.auth.params.expires_in * 1000; // ms
      req.session.expires = new Date(Date.now() + expires_in).toISOString();
      req.session.userId = 'google:' + email; // create user id as a compound key 'provider:id'
      req.session.user = {
        provider: 'google',
        id: req.session.userId,
        displayName: req.user.displayName,
        email: email,
        photo: req.user.photos[0].value
      };

      var DAY = 24 * 60 * 60 * 1000;
      var maxAge = 14 * DAY; // 14 days
      req.session.cookie.expires = new Date(Date.now() + maxAge).toISOString();
      req.session.cookie.maxAge = maxAge;

      var redirectTo = req.session.redirectTo || '/';
      return res.redirect(redirectTo);
    });

/**
 * Facebook login callback
 */
app.get('/api/v1/auth/facebook/callback',
    passport.authenticate('facebook'), function(req, res) {
      // copy needed fields to the session object
      var expires_in = req.user.auth.params.expires * 1000; // ms
      req.session.expires = new Date(Date.now() + expires_in).toISOString();
      req.session.userId = 'facebook:' + req.user.id; // create user id as a compound key 'provider:id'
      req.session.user = {
        provider: 'facebook',
        id: req.session.userId,
        displayName: req.user.displayName,
        email: null,
        photo: `https://graph.facebook.com/v2.1/${req.user.id}/picture`
      };

      var DAY = 24 * 60 * 60 * 1000;
      var maxAge = 14 * DAY; // 14 days
      req.session.cookie.expires = new Date(Date.now() + maxAge).toISOString();
      req.session.cookie.maxAge = maxAge;

      var redirectTo = req.session.redirectTo || '/';
      return res.redirect(redirectTo);
    });

/**
 * Sign in request for a Google account
 */
app.get('/api/v1/auth/google/signin', function(req, res) {
  req.session.redirectTo = req.query.redirectTo || '/';
  debug('google signin redirectTo=' + req.session.redirectTo);
  return res.redirect('/api/v1/auth/google');
});

/**
 * Sign in request for a Google account
 */
app.get('/api/v1/auth/facebook/signin', function(req, res) {
  req.session.redirectTo = req.query.redirectTo || '/';
  debug('facebook signin redirectTo=' + req.session.redirectTo);
  return res.redirect('/api/v1/auth/facebook');
});

/**
 * Sign out request (both for Google and Facebook)
 */
app.get('/api/v1/auth/signout', function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      debug(err);
    }

    return res.redirect(req.query.redirectTo || '/');
  });
});

/**
 * Get currently logged in user profile (if any)
 */
app.get('/api/v1/auth/user', function (req, res) {
  var profile;
  if (req.session && req.session.user) {
    profile = req.session.user;
  }
  else {
    profile = {}; // not logged in
  }

  return res.json(profile);
});

/**
 * List all documents of the current user
 */
app.get('/api/v1/docs', function (req, res) {
  db.view('users', 'docs', {keys: [req.session.userId]}, function (err, body) {
    if (err) {
      return res.status(err.statusCode || 500).send(err.toString());
    }

    return res.json(body);
  });
});

/**
 * Get a document
 */
app.get('/api/v1/docs/:id', function (req, res) {
  db.get(req.params.id, function (err, doc) {
    if (err) {
      return res.status(err.statusCode || 500).send(err.toString());
    }

    if (!authorized(doc, req.session.userId, 'read')) {
      return res.status(403).send(new Error('You are not authorized to view this document').toString());
    }

    return res.json(doc);
  });
});

/**
 * Create a new document
 */
app.post('/api/v1/docs', function (req, res) {
  // authorize
  if (!req.session.userId) {
    return res.status(403).send(new Error('You must be logged in to create a new document.').toString());
  }

  // validate request
  if (req.body._id) {
    return res.status(400).send('Cannot create document: document already contains an "_id" field.')
  }
  if (req.body._rev) {
    return res.status(400).send('Cannot create document: document already contains an "_rev" field.')
  }

  // set date updated
  req.body.updated = new Date().toISOString();

  // set authorization
  if (!req.body.auth) {
    req.body.auth = {};
    req.body.auth[req.session.userId] = 'owner';
  }

  function insert (trial) {
    // generate a random, human friendly id
    var len = 6 + 2 * trial;
    var MAX_TRIALS = 4;
    req.body._id = getFriendlyId(len);

    db.insert(req.body, function (err, body) {
      if (err) {
        if (err.statusCode === 409) { // document update conflict
          if (trial < MAX_TRIALS) {
            // try again with another random id
            insert(trial + 1);
          }
          else {
            // give up
            res.status(err.statusCode || 500).send('Error: failed to generate a unique id');
          }
        }
        else {
          res.status(err.statusCode || 500).send(err.toString());
        }
      }
      else {
        res.json(body);
      }
    });
  }

  var trial = 0;
  insert(trial);
});

/**
 * Update an existing document
 */
app.put('/api/v1/docs/:id', function (req, res) {
  // validate
  if (!req.body._id) {
    return res.status(400).send('Cannot update document: "_id" field missing in document.')
  }
  if (!req.body._rev) {
    return res.status(400).send('Cannot update document: "_rev" field missing in document.')
  }

  // first, get the current document, so we can authorize this update
  db.get(req.params.id, function (err, doc) {
    if (err) {
      return res.status(err.statusCode || 500).send(err.toString());
    }

    if (!authorized(doc, req.session.userId, 'write')) {
      return res.status(403).send(new Error('You are not unauthorized to update this document').toString());
    }

    // set date updated
    var updatedDoc = req.body;
    updatedDoc.updated = new Date().toISOString();
    updatedDoc.auth = doc.auth; // don't allow overriding the document authorization

    // save the updated doc
    db.insert(updatedDoc, function (err, body) {
      if (err) {
        return res.status(err.statusCode || 500).send(err.toString());
      }

      return res.json(body);
    });
  });

});

/**
 * Delete a document
 */
app.delete('/api/v1/docs/:id/:rev', function (req, res) {

  // TODO: authorize for deleting this doc

  // first, get the current document, so we can authorize this delete
  db.get(req.params.id, function (err, doc) {
    if (err) {
      return res.status(err.statusCode || 500).send(err.toString());
    }

    if (!authorized(doc, req.session.userId, 'owner')) {
      return res.status(403).send(new Error('You are not unauthorized to delete this document').toString());
    }

    db.destroy(req.params.id, req.params.rev, function (err, body) {
      if (err) {
        return res.status(400).send(err.toString());
      }

      return res.json(body);
    });
  });
});


/**
 * Setup CouchDB: create database and views. Once in a lifetime action
 */
function init_db () {
  // create the database if not existing
  // will just fail if already existing
  nano.db.create(DB_NAME, function(err){
    if (!err) {
      debug('Database "' + DB_NAME + '" created');
    }

    // create a view listing all documents of current user
    var view = {
      "_id": "_design/users",
      "_rev": "4-fd201cea723f5384c460aeeedf6c35b4",
      "views": {
        "docs": {
          "map": "function (doc) {\n  if (doc.auth) {\n    for (var userId in doc.auth) {\n      if (doc.auth[userId] != undefined) {\n        emit(userId, {_id: doc._id, _rev: doc._rev, title: doc.title, updated: doc.updated});\n      }\n    }\n  }\n}"
        }
      }
    };

    db.insert(view, function (err) {
      if (!err) {
        debug('View "' + view._id + '" created or updated');
      }
    });
  });
}

/**
 * Test whether given user is authorized to perform an action in a certain role
 * @param {Object} doc
 * @param {string} userId
 * @param {"owner" | "write" | "read"} role   The requested role for an action
 *                                            on the document.
 * @return {boolean} Returns true if authorized, else returns false
 */
function authorized (doc, userId, role) {
  var userRole = doc.auth && doc.auth[userId];

  switch (role) {
    case 'read':
      return (userRole === 'owner' || userRole === 'write' || userRole === 'read' );

    case 'write':
      return (userRole === 'owner' || userRole === 'write');

    case 'owner':
      return (userRole === 'owner');

    default:
      throw new Error('Unknown role "'  + role + '". ' +
          'Available roles: "read", "write", or "owner".')
  }
}

// TODO: refresh access token when expired

/**
 * Retrieve a new access token from a given refreshToken
 * https://developers.google.com/accounts/docs/OAuth2WebServer#refresh
 * @param {String} refreshToken
 * @return {Promise<Object>} Resolves with an `object` containing parameters
 *                           access_token, token_type, expires_in, and id_token
 */
function refreshAccessToken (refreshToken) {
  return new Promise(function (resolve, reject) {
    var url = 'https://accounts.google.com/o/oauth2/token';
    var form = {
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token'
    };

    request.post(url, {form: form}, function (error, response, body) {
      if (error) {
        reject(error);
      }
      else {
        resolve(JSON.parse(body));
      }
    });
  });
};
