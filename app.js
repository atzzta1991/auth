require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set("view engine", "ejs");

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});


userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"]
});

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({
    username: username
  }, function(err, foundUser) {
    if (!err) {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
        } else {
          res.send("Pw does not match");
        }
      } else {
        res.send("Username does not match");
      }
    } else {
      console.log(err);
    }
  });
});

app.route("/register")
  .get(function(req, res) {
    res.render("register");
  })
  .post(function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    const newUser = new User({
      username: username,
      password: password
    });
    newUser.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
      }
    });
  });

app.listen(3000, () => {
  console.log("Server started at port 3000");
});
