import express from "express";
import env from "dotenv";
import pg from "pg";
import ejs, { render } from "ejs";
import bodyParser from "body-parser";
import session  from "express-session";



env.config();
const app = express();
const port = process.env.PORT||3000;

app.use(session({
  secret: process.env.SESSION_SECRET || "sdnasdk568976AT", 
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, 
    maxAge: 1000 * 60 * 60 * 24 * 7 
  }
}));

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view-engine","ejs");


app.use(bodyParser.urlencoded({extended:true}));

app.get("/",(req,res)=>{
    res.render("home.ejs");
})


app.get("/login",(req,res)=>{
  res.render("login.ejs");
})

app.post("/login",async (req,res)=>{
  const user = req.body; 
  if(user.email && user.password){
    try{
      const respose = await db.query("SELECT id,name FROM users WHERE email=$1 AND password=$2",[user.email,user.password]);
      if(respose.rows.length==1){
        req.session.user = respose.rows[0];
        res.redirect("/challenges");
      }
      else{
        res.render("login.ejs",{
          formData:req.body,
          message:"ID or password is incorrect!"
        });
      }
    }
    catch(err){
      res.render("login.ejs",{
        formData:req.body,
        message:"Something Went Wrong!"
      });
    }
  }
  else{
    res.render("login.ejs",{
      formData:req.body,
      message:"ID or password is filled properly!"
    });
  }
})

function isLoggedIn(req, res, next) {
  if (req.session.user) {
    // console.log(req.session.user)
    next();
  } else {
    res.redirect("/login");
  }
}


app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});



app.get("/challenges",isLoggedIn,async (req,res)=>{
  try{
    const respose = await db.query("SELECT id,name,live FROM challenge WHERE show=true");
    res.render("challenges.ejs",{
      data:respose.rows
    });
  }
  catch(err){
    res.render("challenges.ejs",{
      data:[]
    });
  }
  
})


app.get("/play/:cid",isLoggedIn,async (req,res)=>{
  const challengeId=req.params.cid;
  try{
    const respose = await db.query("SELECT * FROM challenge WHERE id=$1",[challengeId]);
    if(respose.rows.length==1){
      const challenge=respose.rows[0];
      if(challenge.live){
        const data={
          challengeId:challenge.id,
          name:challenge.name,
          colors:challenge.colors.split(',')
        }
        res.render("play.ejs",{data});
      }
      else//if not live
        res.render("message.ejs",{
          data:{
            heading:"❌ Challenge is not started!",
            description:"The challenge you're trying to access hasn't started yet. Keep an eye on this space and sharpen your CSS skills in the meantime. Get ready to join the battle once it goes live!"
          }
        });
    }
    else//if challege not found
      res.render("message.ejs",{
        data:{
          heading:"❌ Challenge not found!",
          description:"The challenge ID you entered does not exist. Please check the challenge ID or explore other challenges."
        }
      });
  }
  catch(err){//if something went wrong
    res.render("message.ejs",{
      data:{
        heading:"❌ Challenge not found!",
        description:"The challenge ID you entered does not exist. Please check the challenge ID or explore other challenges."
      }
    });
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});