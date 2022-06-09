const express = require("express");
 
// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();
 
// This will help us connect to the database
const dbo = require("../db/conn");
 
// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;
 
 
// This section will help you get a list of all the records.
recordRoutes.route("/record").get(function (req, res) {
 let db_connect = dbo.getDb("employees");
 db_connect
   .collection("routines")
   .find({})
   .toArray(function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});

recordRoutes.route("/record/routines")
  .get(function(req, res){
    let db_connect = dbo.getDb("employees");
    let myquery = {user: req.query.user};
    db_connect
      .collection("routines")
      .findOne(myquery, function(err, result){
        console.log(req.query.user)
        if(err) throw err;
        res.json(result);
    })
  })
  .post(function(req, res){
    let db_connect = dbo.getDb("employees");
    let myobj = {
      user: req.body.user, 
      routine: req.body.routine
    }
    db_connect
      .collection("routines")
      .insertOne(myobj, function(err, result){
        if(err) throw err;
        res.json(result);
  });
})

// This section will help you get a single record by id
recordRoutes.route("/record/user").get(function (req, res) {
 let db_connect = dbo.getDb("employees");
 let myquery = { user: req.query.user, routine: req.query.routine};
 db_connect
     .collection("exerciseRoutines")
     .findOne(myquery, function (err, result) {
       if (err) throw err;
       console.log(result);
       res.json(result);
     });
});
 
// This section will help you create a new record.
recordRoutes.route("/record/add").post(function (req, response) {
 let db_connect = dbo.getDb("employees");
 let myobj = {
   user: req.body.user,
   routine: req.body.routine,
   date: req.body.date,
   data: req.body.data
 };
 db_connect.collection("exerciseRoutines").insertOne(myobj, function (err, res) {
   if (err) throw err;
   response.json(res);
 });
});
 
// This section will help you update a record by id.
recordRoutes.route("/record/update").put(function (req, response) {
 let db_connect = dbo.getDb("employees"); 
 let myquery = { user: req.body.user, routine: req.body.routine}; 
 let newvalues = {   
   $set: {     
    data: req.body.data
   }, 
  }
  db_connect.collection("exerciseRoutines").updateOne(myquery, newvalues, function(err,res){
    if(err) throw err;
    console.log("1 document update");
    response.json(res);
  })
});

recordRoutes.route("/record/update/date").put(function (req, response) {
  let db_connect = dbo.getDb("employees"); 
  let myquery = { user: req.body.user, routine: req.body.routine}; 
  let newvalues = {   
    $set: {     
     date: req.body.date
    }, 
   }
   db_connect.collection("exerciseRoutines").updateOne(myquery, newvalues, function(err,res){
     if(err) throw err;
     console.log("1 document update");
     response.json(res);
   })
 });

recordRoutes.route("/record/update/routine").put(function (req, response) {
  let db_connect = dbo.getDb("employees"); 
  let myquery = { user: req.body.user}; 
  let newvalues = {   
    $set: {     
     routine: req.body.routine
    }, 
   }
   db_connect.collection("routines").updateOne(myquery, newvalues, function(err,res){
     if(err) throw err;
     console.log("1 document update");
     console.log(req.body.routine);
     console.log(req.body.user);
     response.json(res);
   })
 });
 
// This section will help you delete a record
recordRoutes.route("/record/delete/routine").delete((req, response) => {
 let db_connect = dbo.getDb("employees");
 let myquery = { user: req.body.user};
 db_connect.collection("routines").deleteOne(myquery, function (err, obj) {
   if (err) throw err;
   console.log("1 document deleted");
   response.json(obj);
 });
});

recordRoutes.route("/record/delete").delete((req,response)=>{
  let db_connect = dbo.getDb("employees");
  let myquery = {user: req.query.user, routine: req.query.routine};
  db_connect.collection("exerciseRoutines").deleteOne(myquery, function(err, obj){
    if(err) throw err;
    console.log("1 document deleted");
    response.json(obj);
  })
})
 
module.exports = recordRoutes;