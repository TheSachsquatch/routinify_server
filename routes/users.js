const express = require("express");

const userRoutes  = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const dbo = require("../db/conn");
const path = require('path');
const ObjectId = require("mongodb").ObjectId;
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require("google-auth-library");
const { response } = require("express");
const client = new OAuth2Client(process.env.CLIENT_ID);
async function verify(token){
    if(token!=null){
        const ticket = await client.verifyIdToken({
            idToken: token, audience: process.env.CLIENT_ID
        })
        const payload = ticket.getPayload();
        return payload;
    }
    else{
        console.error("err");
    }
    
}

userRoutes.route("/users/google")
    .get(function(req, res){
        let token = req.query.token;
        verify(token).catch(console.error).then((payload)=>{
            const userid = payload['sub'];
            const user = payload['name'];
            req.session.user = user;
            let db_connect = dbo.getDb("employees");
            let myquery = {user_id: userid}
            db_connect  
                .collection("users_google")
                .findOne(myquery, function(err, response){
                    if(err) throw err;
                    if(response!=null){
                        console.log(response);
                        res.json({existing: true, loggedIn: true, user: response.user})
                    }
                    else{
                        res.json({user: userid})
                    }
                })
        });
    })

    .post(function(req, response){
        let {token} = req.body;
        verify(token).catch(console.error).then((payload)=>{
            const userid = payload['sub'];
            const user = payload['name'];
            req.session.user = user;
            let db_connect = dbo.getDb("employees");
            console.log(userid);
            let obj = {
                user_id: userid,
                user: user
            }
            db_connect
                .collection("users_google").insertOne(obj, function(err, res) {
                    if(err) throw err;
                    response.json(res);
                    
                })
        })
    })

userRoutes.route("/users").get(function (req, res) {
    let db_connect = dbo.getDb("employees");
    db_connect
      .collection("users")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        res.json(result);
      });
   });

userRoutes.route("/users/register").post(function (req, response) {
 let pw = req.body.password;
 let db_connect = dbo.getDb();
 bcrypt.hash(pw, saltRounds, (err,hash)=> {
     if(err){
         console.log(err);
     }
     let obj = {
         user:req.body.username,
         password:hash
     }
     db_connect.collection("users").insertOne(obj, function (err, res) {
        if (err) throw err;
        response.json(res);
      });
 });
});

const verifyJWT = (req, res, next) =>{
    const token = req.headers["x-access-token"]

    if(!token){
        res.send("Token needed");
    }
    else{
        const secr = process.env.JWT_SECRET;
        jwt.verify(token, secr , (err, decoded)=>{
            if(err){
                res.json({auth: false, message: "Failed to authenticate"});
            }
            else{
                req.userID = decoded.id;
                next();
            }
        })
    }
}

userRoutes.route("/users/isUserAuth").get(verifyJWT, function (req, res){
    res.send({isAuthenticated: true});
});

userRoutes.route("/users/login")
    .get(function(req,res){
        if(req.session.user){
            res.send({loggedIn: true, user: req.session.user});
        }
        else{
            res.send({loggedIn:false, user: req.session.user});
        }
    })
    .post(function (req, res) {
        let password = req.body.password;
        let db_connect = dbo.getDb();
        let myquery = { user: req.body.username};
        db_connect
            .collection("users")
            .findOne(myquery, function (err, result) {
                if (err) throw err;
                if(result){
                bcrypt.compare(password, result.password, (error, response)=>{
                    if(response){
                        const id = result._id.toString();
                        const token = jwt.sign({id}, process.env.JWT_SECRET, {
                            expiresIn: 300, 
                        });
                        req.session.user = result.user;
                        console.log(req.session.user);
                        res.json({auth: true, token: token, user: req.session.user})
                    }
                    else{
                        console.log(error);
                        res.send({auth: false, message: "Wrong username/password combination"});
                    }
                });
                }
                else{
                    console.log(result);
                    res.send({auth: false, message: "User does not exist"});
                }
                
    });
})

module.exports = userRoutes;
    