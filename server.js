var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var util = require("uuid");

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
// GET  /api/texts	return all texts
// POST /api/texts	insert a new text
// PUT  /api/texts/:id	update text (with content)
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
	req.body.content='';
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

//
// POST 	/api/rows/:newindex	insert a new row at newindex. Shift all subsequent row indexes
// DELETE 	/api/rows/:index	delete row at given index
//

app.post("/api/rows/:newindex", function(req, res) {
  var newTextArray = req.body;

  console.log("inserting a new row at index " + req.params.newindex );
  console.log(newTextArray);

  // shift all subsequent rows, if any
  db.collection(TEXTS_COLLECTION).updateMany( { row: { $gte: parseInt(req.params.newindex) } } , { $inc: { row: 1 }  } , function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update texts during row insertion");
    } 
  });

  // insert a new row at newindex
  db.collection(TEXTS_COLLECTION).insert(newTextArray, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to insert a new row.");
    } else {
      res.status(200).json(doc);
    }
  });


});

app.delete("/api/rows/:index", function(req, res) {

  // delete row 
  db.collection(TEXTS_COLLECTION).deleteMany( { row: { $eq: parseInt(req.params.index) } } , function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to delete a row.");
    } 
  });

  // shift all subsequent rows, if any
  db.collection(TEXTS_COLLECTION).updateMany( { row: { $gt: parseInt(req.params.index) } } , { $inc: { row: -1 }  } , function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update texts during row deletion");
    } else {
      res.status(200).json(doc);
    }
  });


});



