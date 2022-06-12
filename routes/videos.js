const express = require("express");
 
// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const videoRoutes = express.Router();
 
// This will help us connect to the database
const dbo = require("../db/conn");
 
// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;

const playwright = require('playwright-chromium');

videoRoutes.route("/videos/videoscrape").post(async function(req, res){

    try{
        const exer = req.body.exercise;
        if(exer ==null){
            res.json({"found": false})
        }
        console.log(exer);
        let query_string= "";
        query_string = exer.replace(/ /g, '+');
        const query = "how+to+"+query_string;
        url = 'https://www.youtube.com/results?search_query=' + query;
        const browser = await playwright.chromium.launch({ 
        })

        const page = await browser.newPage();
        await page.goto(url);
        console.log(url);
        let video = "";
        let title = "";
        const vid = await page.$$eval('#video-title', element =>{
            let i = 0;
            while(i<element.length && element[i]==undefined ){
                i++;
            }
            console.log(i);
            return{
            href: element[i].href,
            title: element[i].title}
        })
        
        if(vid ==null){
            res.json({"found": false})
            console.log(false)
        }
        video = vid.href;
        title = vid.title;
        await browser.close();

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
    }
    catch(err){
        console.log(err)
    }
    
})

videoRoutes.route("/videos/video")
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