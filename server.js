const mongoose = require('mongoose');
const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const Data = require('./data');
var http = require('http');

const 	API_PORT = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
		ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

const app = express();

app.use(cors());
app.set('port', API_PORT);

const router = express.Router();

const mongoURL =
  'mongodb+srv://admin:admin@cluster0-x8coq.mongodb.net/test?retryWrites=true&w=majority';
// connects our back end code with the database
mongoose.connect(mongoURL, { useNewUrlParser: true });

let db = mongoose.connection;

db.once('open', () => console.log('connected to the database'));

// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

// this is our get method
// this method fetches all available data in our database
router.get('/getData', (req, res) => {
  Data.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});
// this is our create method
// this method adds new data in our database
router.post('/putData', (req, res) => {
  let data = new Data();

  const { id, user, text } = req.body;

  if ((!id && id !== 0) || !user) {
    return res.json({
      success: false,
      error: 'INVALID INPUTS',
    });
  }
  data.user = user;
  data.text = text;
  data.id = id;
  data.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// append /api for our http requests
app.use('/api', router);


var server = http.createServer(app);
server.listen(API_PORT);

/*
// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
*/

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
