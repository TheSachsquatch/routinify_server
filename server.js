const express = require("express");
const app = express();
const cors = require("cors");
const session = require('cookie-session')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;
//app.use(cors());
app.use(cors({
  origin: ["http://localhost:3000", "https://routinifly.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
const dbo = require("./db/conn");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended:true}));
app.use(session({
    keys: ["userID"],
    secret: process.env.COOKIE_SECRET,
    maxAge: 60*60*24, 
}));

app.use(express.json());
app.use(require("./routes/record"));
app.use(require("./routes/users"));
app.use(require("./routes/videos"));
app.use(require("./routes/videoscrape"))
// get driver connection

app.listen(port, () => {
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
 
  });
  console.log(`Server is running on port: ${port}`);
});