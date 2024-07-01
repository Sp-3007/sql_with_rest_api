const { faker } = require("@faker-js/faker");
const data = require("./fakedata");
const config = require("./config");
const mysql = require("mysql2");
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("connection id :" + connection.threadId);
});

const userid = () => {
  return faker.string.uuid();
};

app.get("/add-user", (req, res) => {
  res.render("adduser.ejs");
});

app.get("/", (req, res) => {
  connection.query("select count(*) as count from user2", (err, result) => {
    if (err) {
      res.status(500).send("Something Bad with database");
    }
    let user = result[0];
    res.render("home.ejs", { user });
  });
});

app.get("/users", (req, res) => {
  try {
    connection.query("select * from user2", (err, result) => {
      if (err) {
        res.send("Something wrong with database");
      }
      let users = result;
      res.status(200).render("users.ejs", { users });
    });
  } catch {
    res.send("Somethign wrong ith database");
  }
});

//perticular user data
app.get("/user/:id", (req, res) => {
  try {
    connection.query(
      "select * from user2 where id = ?",
      [req.params.id],
      (err, result) => {
        if (err) {
          res.send("No user Found");
        }
        let user = result[0];
        res.status(200).render("user.ejs", { user });
      }
    );
  } catch {
    res.send("Somethign wrong ith database");
  }
});

//Updating user
app.patch("/user/:id", (req, res) => {
  try {
    connection.query(
      "SELECT password FROM user2 WHERE id = ?",
      [req.params.id],
      (err, result) => {
        if (err || result.length === 0) {
          return res.status(404).send("No user found");
        }
        let password = result[0].password;
        if (password === req.body.password) {
          try {
            connection.query(
              "UPDATE user2 SET name = ? WHERE id = ?",
              [req.body.name, req.params.id],
              (err, result) => {
                if (err) {
                  return res.status(500).send("Username does not updated");
                }
                res.status(200).send("Username updated successfully");
              }
            );
          } catch (err) {
            res.status(500).send("Something went wrong with the database");
          }
        } else {
          res.status(400).send("Enter valid password");
        }
      }
    );
  } catch (err) {
    res.status(500).send("Something went wrong with the database");
  }
});

app.post("/user", (req, res) => {
  const { name, email, password } = req.body;
  id = userid();

  try {
    connection.query(
      "insert into user2 values(?,?,?,?)",
      [id, name, email, password],
      (err, result) => {
        if (err) {
          res.send("No user Added");
        }
        console.log("user added");
        res.redirect("/");
      }
    );
  } catch(err){
    res.status(400).send(err);
  };
});

app.get("/user/:id/Delete",(req,res)=>{
  try{
      connection.query("select * from user2 where id = ?",[req.params.id],(err,result)=>{
        if(err){
          res.status(400).send("User Does Not exist");
        }
        const user = result[0]
        res.render("delete.ejs",{user})
      })
  }
  catch(err){
    res.send("Something wrong with database");
  };
   
});

app.delete("/user/:id",(req,res)=>{
  const {password} =req.body
     connection.query("select password from user2 where id=?",[req.params.id],(err,result)=>{
      if (err){
        res.send("Something wrong with database");
      }

      if(password == result[0].password){
        try{
          connection.query("delete from user2 where id=?",[req.params.id],(err,result)=>{
            if(err){
              res.send("No such User in database")
            }
            res.redirect("/users");
          })
        }catch(err){
          res.send(err)
        }
      }
      else{
        res.send("Enter Valid Password");
      }
     })
});

app.listen(3000, () => {
  console.log("App id listing to post 3000");
});
