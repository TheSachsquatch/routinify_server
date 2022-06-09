const express = require("express");
 
// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const videoRoutes = express.Router();
 
// This will help us connect to the database
const dbo = require("../db/conn");
 
// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;

const playwright = require('playwright');

videoRoutes.route("/videoscrape").post(async function(req, res){

    const exer = req.body.exercise;
    const exer_split = exer.split(" ");
    let query_string= "";
    for(word of exer_split){
        query_string+=word+"+";
    }
    query_string = query_string.slice(0,-1);
    const query = "how+to+"+query_string;
    url = 'https://www.youtube.com/results?search_query=' + query;
    const browser = await playwright.chromium.launch({
    })

    const page = await browser.newPage();
    await page.goto(url);
    let video = "";
    let title = "";
    const vid = await page.$$eval('#video-title', element =>{
        return {href: element[1].href, title: element[1].title};
    })
    video = vid.href;
    title = vid.title;
    await page.close();

    let video_embed = video.replace("watch?v=", "embed/")
    let db_connect = dbo.getDb("employees");
    let myobj = {exercise: exer, video: video_embed, title: title};
    db_connect
        .collection("videos")
        .insertOne(myobj, function(err, result){
            if(result!=null){
                res.json(myobj);
            }
            else{
                console.log(result);
            }
        })
})

videoRoutes.route("/video")
    .get(function(req, res){
        let db_connect = dbo.getDb("employees");
        let myquery = {exercise: req.query.exercise};
        db_connect
            .collection("videos")
            .findOne(myquery, function(err, result){
               if(err) throw err;
               res.json(result);
            })
    })

module.exports = videoRoutes;