import express from "express";
import env from "dotenv";
import pg from "pg";
import ejs, { render } from "ejs";
import bodyParser from "body-parser";
import session  from "express-session";

env.config();
const app = express();
const port = process.env.PORT||3000;

// Login 
app.use(session({
  secret: process.env.SESSION_SECRET || "sdnasdk568976AT", 
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, 
    maxAge: 1000 * 60 * 60 * 24 * 7 
  }
}));

// DB Connection 
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

// Middlewares 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view-engine","ejs");


app.use(bodyParser.urlencoded({extended:true}));


// Home render 
app.get("/",(req,res)=>{
    res.render("home.ejs");
})

// Login Get 
app.get("/login",(req,res)=>{
  res.render("login.ejs",{
    formData:{
      email:"205123080@nitt.edu",
      password:"johndoe"
    }
  });
})

// Login Post
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

// Logout Get  
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});


// Challenges Get 
// app.get("/challenges",async (req,res)=>{
//   try{
//     const respose = await db.query("SELECT id,name,live FROM challenge WHERE show=true");
//     res.render("challenges.ejs",{
//       data:respose.rows
//     });
//   }
//   catch(err){
//     res.render("challenges.ejs",{
//       data:[]
//     });
//   }
  
// })

app.get("/challenges",async (req,res)=>{
  try{
    const respose = await db.query("select to_char(starttime,'DD MON YY HH:MI:SS AM') starttimeformat,challenges.name,questionid,starttime,duration,(starttime + duration * interval '1 minute') endtime from challenges inner join problems on problems.id=challenges.questionId WHERE starttime + duration * interval '1 minute' > NOW();");
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

// Challenges Specific Get
// app.get("/play/:cid",async (req,res)=>{
//   const challengeId=req.params.cid;
//   try{
//     const respose = await db.query("SELECT * FROM challenge WHERE id=$1",[challengeId]);
//     if(respose.rows.length==1){
//       const challenge=respose.rows[0];
//       if(challenge.live){
//         const data={
//           challengeId:challenge.id,
//           name:challenge.name,
//           colors:challenge.colors.split(',')
//         }
//         res.render("play.ejs",{data});
//       }
//       else//if not live
//         res.render("message.ejs",{
//           data:{
//             heading:"❌ Challenge is not started!",
//             description:"The challenge you're trying to access hasn't started yet. Keep an eye on this space and sharpen your CSS skills in the meantime. Get ready to join the battle once it goes live!"
//           }
//         });
//     }
//     else//if challege not found
//       res.render("message.ejs",{
//         data:{
//           heading:"❌ Challenge not found!",
//           description:"The challenge ID you entered does not exist. Please check the challenge ID or explore other challenges."
//         }
//       });
//   }
//   catch(err){//if something went wrong
//     res.render("message.ejs",{
//       data:{
//         heading:"❌ Challenge not found!",
//         description:"The challenge ID you entered does not exist. Please check the challenge ID or explore other challenges."
//       }
//     });
//   }
// })


app.get("/play/:cid",async (req,res)=>{
  const challengeId=req.params.cid;
  const currDate=new Date();
  try{
    const respose = await db.query("select challenges.name name,problems.id id,problems.colors,starttime,duration,(starttime + duration * interval '1 minute') endtime from challenges inner join problems on challenges.questionid = problems.id WHERE challenges.name=$1;",[challengeId]);
    if(respose.rows.length==1){
      const challenge=respose.rows[0];
      if(challenge.starttime<= currDate && currDate <= challenge.endtime){
        const data={
          challengeId:challenge.id,
          name:challenge.name,
          endTime:challenge.endtime,
          
          colors:challenge.colors.split(',')
        }
        res.render("play.ejs",{data});
      }
      else//if not live
        res.render("message.ejs",{
          data:{
            heading:"❌ Challenge is not live!",
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


//AdminPanel
app.get('/adminpanel', (req, res) => {
  res.render("adminpanel/home.ejs");
});

app.get('/adminpanel/problems',async (req, res) => {
  try{
    const respose = await db.query("SELECT id,name FROM problems");
    res.render("adminpanel/problems.ejs",{
      data:respose.rows
    });
  }
  catch(err){
    res.render("message.ejs",{
      data:{
        heading:"❌ Cannot get problems!",
        description:err.detail,
        button:{
          link: "/adminpanel", 
          text: "Admin Panel"
        }
      }
    });
  }
});

app.get('/adminpanel/challenges',async (req, res) => {
  try{
    const respose = await db.query("select c.name,p.id problemId,p.name problemName,starttime,duration from challenges c inner join problems p on c.questionid=p.id;");
    res.render("adminpanel/challenges.ejs",{
      data:respose.rows
    });
  }
  catch(err){
    res.render("message.ejs",{
      data:{
        heading:"❌ Cannot get challenges!",
        description:err.detail,
        button:{
          link: "/adminpanel", 
          text: "Admin Panel"
        }
      }
    });
  }
});

app.get('/adminpanel/create-challenge',async (req, res) => {
  try{
    const respose = await db.query("SELECT id,name FROM problems");
    res.render("adminpanel/create-challenge.ejs",{
      data:respose.rows
    });
  }
  catch(err){
    res.render("message.ejs",{
      data:{
        heading:"❌ Cannot fetch problems!",
        description:err.detail,
        button:{
          link: "/adminpanel", 
          text: "Admin Panel"
        }
      }
    });
  }
});

app.post('/adminpanel/create-challenge',async (req, res) => {
  const data=req.body;
  try{
    await db.query("insert into challenges(name,questionId,starttime,duration) values ($1,$2,$3,$4);",[encodeURI(data.name),data.problem,data.starttime,data.duration]);
    res.redirect("/adminpanel/challenges");
  }
  catch(error){
    res.render("message.ejs",{
      data:{
        heading:"❌ Something went wrong!",
        description:error.detail,
        button:{
          link: "/adminpanel/create-challenge", 
          text: "Try Again"
        }
      }
    });
  }
});

// App Listen 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});