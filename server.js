var express = require('express');
var app = express();

var PORT = process.env.PORT || 3000;

// serve static files from dist folder.
// should be generated beforehand by running `npm run build`
app.use(express.static('dist'));

app.listen(PORT, function () {
  console.log('Listening at http://localhost:' + PORT + '/');
});
