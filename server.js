//
// ROGSE SERVER
//

//
// APP EXPRESS DECLARATION
//

var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.engine('html', require('ejs').renderFile);

//
// INITIALIZE DATABASE : postgreSQL
//

var pg = require('pg');
var Transaction = require('pg-transaction');
 
// Create link to Angular build directory
var distDir = __dirname + "/dist/";
app.use(bodyParser.json());
app.use(express.static(distDir));

// Initialize the app.
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
};

//
// herebelow starts the REST API
//

//
// GET  /api/doc/:docId/texts		return all texts of the given document
// POST /api/doc/:docId/texts		insert a new text
// PUT  /api/doc/:docId/texts/:id	update text (with content)
// 
app.get("/api/doc/:docId/texts", function(req, res) {

  // Grab data from the URL parameters
  const docId = req.params.docId;

  const results = [];
  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if(err) {
      done(); console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query('SELECT * FROM texts WHERE docId = ($1) ;', [docId]);
    query.on('row', (row) => {
      results.push(row);
    });
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

app.post("/api/doc/:docId/texts", function(req, res) {

  // Grab data from the URL parameters
  const docId = req.params.docId;

  var newText = req.body;
  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if(err) {
      done(); console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('INSERT INTO texts(id, content, row, col, docId) values($1, $2, $3, $4, $5);',
    [newText.id, newText.content, newText.row, newText.col, docId]);
    done();
  });
  return res.status(200).json({success: true});
});

app.put("/api/doc/:docId/texts/:id", function(req, res) {

  // Grab data from the URL parameters
  const docId = req.params.docId;
  const id = req.params.id;

  // Grab data from http request
  const data = {content: req.body.content || '' };

  console.log("received put call on texts collection:");
  console.log(id);
  console.log(docId);
  console.log(data);

  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if(err) {
      done(); console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    console.log('UPDATE texts SET content=('+data.content+') WHERE id = ('+id+') and docId = (' + docId + ');');
    client.query('UPDATE texts SET content=($1) WHERE id = ($2) AND docId = ($3);', [data.content, id, docId]);
    done();
  });
  return res.status(200).json({success: true});

});

//
// POST 	/api/doc/:docId/rows/:newindex	insert a new row at newindex. Shift all subsequent row indexes
// DELETE 	/api/doc/:docId/rows/:index	delete row at given index
//

app.post("/api/doc/:docId/rows/:newindex", function(req, res) {

  // Grab data from the URL parameters
  const docId = req.params.docId;
  const index = req.params.newindex;

  // Grab data from http request
  const data = { tArray: req.body };

  console.log("inserting a new row at index " + index );
  console.log(data.tArray);

  // shift all subsequent rows, if any, then insert a new row at newindex, in one transaction
  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if(err) {
      done(); console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    const tx = new Transaction(client);

    tx.begin();

    const q2 = 'UPDATE texts SET row=row+1 WHERE row >= ($1) AND docId = ($2);';
    tx.query(q2,[index,docId]);

    const q3 = 'INSERT INTO texts(id,content,row,col,docId) VALUES ($1,$2,$3,$4,$5);';
    tx.query(q3, [data.tArray[0].id, data.tArray[0].content, data.tArray[0].row, data.tArray[0].col, docId]);
    tx.query(q3, [data.tArray[1].id, data.tArray[1].content, data.tArray[1].row, data.tArray[1].col, docId]);
    tx.query(q3, [data.tArray[2].id, data.tArray[2].content, data.tArray[2].row, data.tArray[2].col, docId]);
    
    tx.commit();

    done();
  });
   
  return res.status(200).json({success: true});
});

app.delete("/api/doc/:docId/rows/:index", function(req, res) {

  // Grab data from the URL parameters
  const index = req.params.index;
  const docId = req.params.docId;

  console.log("deleting a row at index " + index );

  // delete the row, then shift all further rows, if any, in one transaction
  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if(err) {
      done(); console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    const tx = new Transaction(client);

    tx.begin();

    const q3 = 'DELETE FROM texts WHERE row = ($1) AND docId = ($2);';
    console.log(q3);

    tx.query(q3,[index, docId]);
    
    const q2 = 'UPDATE texts SET row=row-1 WHERE row > ($1) and docId = ($2);';
    tx.query(q2,[index, docId]);
    console.log(q2);

    tx.commit();
    console.log('commit');

    done();
    console.log('done');
  });
  return res.status(200).json({success: true});
   
});

//
// GET     /api/doc/:docId/sections		retrieve all sections of the given document
// POST	   /api/doc/:docId/sections		insert a new (empty) section
// PUT     /api/doc/:docId/sections/:tid	update section title with starttextid = tid
// DELETE  /api/doc/:docId/sections/:tid	delete section title with starttextid = tid
//

app.post("/api/doc/:docId/sections", function(req, res) {

  // Grab data from the URL parameters
  const docId = req.params.docId;

  var newSection = req.body;
  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if(err) {
      done(); console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('INSERT INTO sections(title, docid, starttextid) values($1, $2, $3);',
    [newSection.title, docId, newSection.starttextid]);
    done();
  });
  return res.status(200).json({success: true});
});

app.get("/api/doc/:docId/sections", function(req, res) {

  // Grab data from the URL parameters
  const docId = req.params.docId;

  const results = [];
  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if(err) {
      done(); console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query('SELECT * FROM sections WHERE docId = ($1);', [docId]);
    query.on('row', (row) => {
      results.push(row);
    });
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

app.put("/api/doc/:docId/sections/:id", function(req, res) {

  // Grab data from the URL parameters
  const id = req.params.id;
  const docId = req.params.docId;

  // Grab data from http request
  const data = {title: req.body.title || '' };

  console.log("received put call on sections collection:");
  console.log(id);
  console.log(data);

  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if(err) {
      done(); console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    console.log('UPDATE sections SET title=('+data.title+') WHERE starttextid = ('+id+') AND docid = (' + docId + ');');
    client.query('UPDATE sections SET title=($1) WHERE starttextid = ($2) AND docId = ($3);', [data.title, id, docId]);
    done();
  });
  return res.status(200).json({success: true});

});

app.delete("/api/doc/:docId/sections/:id", function(req, res) {

  // Grab data from the URL parameters
  const id = req.params.id;
  const docId = req.params.docId;

  console.log("deleting a section with starttextid = " + id );

  // delete the row
  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if(err) {
      done(); console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    const q3 = 'DELETE FROM sections WHERE starttextid = ($1) AND docId = ($2);';
    console.log(q3);

    client.query(q3,[id, docId]);
    
    done();
    console.log('done');
  });
  return res.status(200).json({success: true});
   
});

//
// GET     /api/doc/			retrieve all documents
// GET     /api/doc/user/:user		retrieve all documents for a given user
// POST    /api/doc/:docId 		create a new document	
// PUT     /api/doc/:docId 		update a document title	
// PUT     /api/doc/:docId/current 	set the document as current (and all others as not current)	
//

app.get("/api/doc/user/:username", function(req, res) {

  const results = [];

  // Grab data from the URL parameters
  const username = req.params.username;

  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if(err) {
      done(); console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    console.log('SELECT * FROM documents WHERE username = (' + username + ');');
    const query = client.query('SELECT * FROM documents WHERE username = ($1);', [username]);
    query.on('row', (row) => {
      results.push(row);
    });
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

// deprecated
app.get("/api/doc/", function(req, res) {
  const results = [];
  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if(err) {
      done(); console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query('SELECT * FROM documents;');
    query.on('row', (row) => {
      results.push(row);
    });
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

app.post("/api/doc/:docId", function(req, res) {

  // Grab data from the URL parameters
  const docId = req.params.docId;

  var newDoc = { title: req.body.title || 'new document' , id: docId,  username: req.body.username || '' };

  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if(err) {
      done(); console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('INSERT INTO documents(title, id, username) values($1, $2, $3);',
    [newDoc.title, docId, newDoc.username]);
    done();
  });
  return res.status(200).json({success: true});
});

app.put("/api/doc/:docId/current/", function(req, res) {

  // Grab data from the URL parameters
  const docId = req.params.docId;

  console.log("setting docId " + docId + " as current" );

  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if(err) {
      done(); console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    const tx = new Transaction(client);

    tx.begin();

    const q2 = 'UPDATE documents SET current = (false) WHERE username IN (SELECT username FROM documents WHERE id = ($1));';
    tx.query(q2,[docId]);

    const q3 = 'UPDATE documents SET current = (true) where id = ($1);';
    tx.query(q3,[docId]);

    tx.commit();

    done();
  });
   
  return res.status(200).json({success: true});

});

app.put("/api/doc/:docId", function(req, res) {

  // Grab data from the URL parameters
  const docId = req.params.docId;

  // Grab data from http request
  const data = {
	title: req.body.title || 'no title' 
	};

  console.log("received put call on sections collection:");
  console.log(data);

  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if(err) {
      done(); console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('UPDATE documents SET title=($1) WHERE id = ($2);', [data.title, docId]);
    done();
  });
  return res.status(200).json({success: true});

});

//
// special route for auth0 authentication callback
//
app.get(
  '*',
  function(req, res) {
    res.render(distDir + 'index.html')
  }
);

