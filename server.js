var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var TEXTS_COLLECTION = "texts";

var app = express();
app.use(bodyParser.json());

// Create link to Angular build directory
var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

//
// ENDPOINT TEXTS
// GET  /api/texts	return all texts
// POST /api/texts	insert a new text
// PUT  /api/texts/:id	update text 
// 
app.get("/api/texts", function(req, res) {
  db.collection(TEXTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get texts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/api/texts", function(req, res) {
  var newText = req.body;

  db.collection(TEXTS_COLLECTION).insertOne(newText, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new text.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

app.put("/api/texts/:id", function(req, res) {
  var updateDoc = req.body;

  if (!req.body.content) {
    handleError(res, "Invalid text input", "Must provide a content.", 400);
  }

  console.log("received put call on texts collection:");
  console.log(req.params.id);
  console.log(req.body);

  db.collection(TEXTS_COLLECTION).update({"id":req.params.id}, { $set: updateDoc } , function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update text");
    } else {
      res.status(200).json(updateDoc);
    }
  });
});


