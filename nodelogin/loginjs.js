var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var ejs = require ("ejs");
var date = require('date-and-time');
var now = new Date();

  var val=date.format(new Date(), 'DD-MM-YYYY');
  console.log(val);
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '30Jan1998#',
  database : 'adi'
});
connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
var app = express();


app.set('view engine', 'ejs')

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(express.static(__dirname +'/public'));



app.get('/', function(request, response) {
  response.render("index");
});

app.get('/login',function(request,response){
  response.render("login1");
});

app.post('/login', function(request, response) {
  var username = request.body.username;
  var password = request.body.pass;
  console.log(username);
  console.log(password);
  if (username && password) {
    connection.query('SELECT * FROM login WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
      if (results.length > 0) {
        request.session.loggedin = true;
        request.session.username = username;
        response.redirect("/main");
      } else {
        response.redirect("/login");
      }
      response.end();
    });
  } else {
    response.send('Please enter Username and Password!');
    response.end();
  }
});

const authCheck = (req, res, next)=>{
  if(!req.session.loggedin){
    res.redirect("/login")
  }
  else{
    next();
  }
};

app.get('/signup',function(request,response){
  response.render("signup");
});

app.post('/signup', function(request, response) {
  var username = request.body.username;
  var name=request.body.name;
  var password = request.body.pass;
  var skill = request.body.skill;
  var hobbies = request.body.hobbies;
  var About=request.body.About;
  console.log(username);
  console.log(password);
  var sql = 'SELECT * FROM login WHERE username = ?';
  connection.query(sql, [username], function (err, result) {
  if (err) throw err;
  console.log(result.length);
    if(result.length==0)
    {
      connection.query("INSERT INTO login VALUES (?,?,?,?,?,?)",[username,name,password,skill,hobbies,About],function(err,result2,field){
        if(err)throw err;
        response.redirect("/login");
    });
  }
   else {
  response.redirect("/signup");
  response.end();
       }
  });
});


app.get('/main', authCheck, function(request,response){
  console.log(request.session.loggedin);
  console.log(request.session);
  query = "select * from data ";
  connection.query(query, function(err, result, field){
    console.log(result);
    query2 = "SELECT * FROM data LIMIT 3;";
    connection.query(query2, function(err, result2, field){
    //response.redirect("/main");
    response.render("main",{result:result,result2:result2});
    });
});
});

app.get('/work/:que', authCheck, function(request,response){
  console.log(request.session.loggedin);
  que=request.params.que;
    query = "select * from login where username = '" + que + "'";
  connection.query(query, function(err, result2, field){
    console.log(result2[0].username);
    response.render("work",{result2:result2[0]});
  });


});

app.get('/post/:ques', authCheck,function(request,response){
  console.log(request.session.loggedin);
  que=request.params.ques;
  console.log(request.params.ques+" ada");
  response.render('post',{que:que});
});


app.post('/post/:ques', authCheck, function(request, response) {
  var answ =request.body.answer;
  var doubt=request.params.ques;
console.log(request.session.username);
  console.log(request.params.ques);


  console.log(val);
  connection.query("INSERT INTO data VALUES (?,?,?,?)",[doubt,answ,request.session.username,val],function(err,result2,field){
  });
  console.log("question ask is "+ doubt);
  query = "select * from data where question = '" + doubt + "'";
  connection.query(query, function(err, result, field){
    console.log(result);
    //response.redirect("/main");
    response.render("ans",{result:result})
  });
});

app.post('/search/:ques', authCheck, function(request, response) {
  var answ =request.body.answer;
  var doubt=request.params.ques;
console.log(request.session.username);
  console.log(request.params.ques);
  connection.query("INSERT INTO data VALUES (?,?,?,?)",[doubt,answ,request.session.username,val],function(err,result2,field){
  });
  console.log("question ask is "+ doubt);
  query = "select * from data where question = '" + doubt + "'";
  connection.query(query, function(err, result, field){
    console.log(result);
    //response.redirect("/main");
    response.render("ans",{result:result})
  });
});


// app.get("/search", (req, res)=>{
//  res.render("ans");
// })

app.get("/search", authCheck, (req, res)=>{
  console.log(req.query);
  query = "select * from data where question = '" + req.query.search + "'"
  connection.query(query, function(err, result, field){
    if(err){
      console.log(err);
    }
    else{
      console.log(result);
      if(result.length==0)
      {
         var que=""+req.query.search;

        console.log(req.query.search);
       res.render("not_exist",{que:que});
      }
      else {
      var id = result[0].id;
      console.log(result[0].question)
      query2 = "select * from data where question = '" + result[0].question + "'";
      connection.query(query2, function(err2, result2, field2){
        if(err){
          console.log(err);
             }
         else{
          res.render("ans", {result:result2})
                 }
      })
    }
  }
  });

  app.get('/search/:id', authCheck,function(request,response){
    console.log(request.session.loggedin);
    response.render("not_exist");
  });


  // res.send("success")
});
app.get('/logout', (req,res)=>{
  console.log("logout")
  req.session.destroy();
  res.redirect('/');
});
app.listen(3000);
