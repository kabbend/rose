var express = require("express");
var bodyParser = require("body-parser");
var app = express();

// postgreSQL
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
// GET  /api/texts	return all texts
// POST /api/texts	insert a new text
// PUT  /api/texts/:id	update text (with content)
// 
app.get("/api/texts", function(req, res) {
  const results = [];
  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if(err) {
      done(); console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query('SELECT * FROM texts;');
    query.on('row', (row) => {
      results.push(row);
    });
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

app.post("/api/texts", function(req, res) {
  var newText = req.body;
  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if(err) {
      done(); console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('INSERT INTO texts(id, content, row, col, docId) values($1, $2, $3, $4, $5);',
    [newText.id, newText.content, newText.row, newText.col, newText.docId]);
    done();
  });
  return res.status(200).json({success: true});
});

app.put("/api/texts/:id", function(req, res) {

  // Grab data from the URL parameters
  const id = req.params.id;
  // Grab data from http request
  const data = {content: req.body.content || '' };

  console.log("received put call on texts collection:");
  console.log(id);
  console.log(data);

  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if(err) {
      done(); console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    console.log('UPDATE texts SET content=('+data.content+') WHERE id = ('+id+');');
    client.query('UPDATE texts SET content=($1) WHERE id = ($2);', [data.content, id]);
    done();
  });
  return res.status(200).json({success: true});

});

//
// POST 	/api/rows/:newindex	insert a new row at newindex. Shift all subsequent row indexes
// DELETE 	/api/rows/:index	delete row at given index
//

app.post("/api/rows/:newindex", function(req, res) {

  // Grab data from the URL parameters
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

    const q2 = 'UPDATE texts SET row=row+1 WHERE row >= ($1);';
    tx.query(q2,[index]);

    const q3 = 'INSERT INTO texts(id,content,row,col) VALUES ($1,$2,$3,$4);';
    tx.query(q3, [data.tArray[0].id, data.tArray[0].content, data.tArray[0].row, data.tArray[0].col]);
    tx.query(q3, [data.tArray[1].id, data.tArray[1].content, data.tArray[1].row, data.tArray[1].col]);
    tx.query(q3, [data.tArray[2].id, data.tArray[2].content, data.tArray[2].row, data.tArray[2].col]);
    
    tx.commit();

    done();
  });
   
  return res.status(200).json({success: true});
});

app.delete("/api/rows/:index", function(req, res) {

  // Grab data from the URL parameters
  const index = req.params.index;

  console.log("deleting a row at index " + index );

  // delete the row, then shift all further rows, if any, in one transaction
  pg.connect(process.env.DATABASE_URL, (err, client, done) => {
    if(err) {
      done(); console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    const tx = new Transaction(client);

    tx.begin();

    const q3 = 'DELETE FROM texts WHERE row = ($1);';
    console.log(q3);

    tx.query(q3,[index]);
    
    const q2 = 'UPDATE texts SET row=row-1 WHERE row > ($1);';
    tx.query(q2,[index]);
    console.log(q2);

    tx.commit();
    console.log('commit');

    done();
    console.log('done');
  });
  return res.status(200).json({success: true});
   
});


