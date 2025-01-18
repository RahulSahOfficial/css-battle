import express from "express";
import env from "dotenv";
import path from "path";
import pg from "pg";
import ejs, { render } from "ejs";
import bodyParser from "body-parser";
import axios from "axios";
import cookieParser from "cookie-parser";
import multer from "multer";

env.config();
const app = express();
const port = process.env.PORT||3000;

console.log(new Date());
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/asset/problems/')
  },
  filename: function (req, file, cb) {
    cb(null,`${Date.now()}-${file.originalname}`)
  }
})

const upload = multer({ storage: storage })

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
app.use(express.json());
app.set("view-engine","ejs");
app.use(cookieParser());



// Home render 
app.get("/",(req,res)=>{
    res.render("home.ejs");
})

// Login Get 
app.get("/login",(req,res)=>{
  res.render("login.ejs",{
    formData:{
      email:"",
      password:""
    }
  });
})

// Login Post
app.post("/login",async (req,res)=>{
  const user = req.body;
  try{
    const response=await axios.post("https://quiz-backend.infotrek24.tech/api/users/login",{
      email:user.email,
      password:user.password
    })
    const responseData=response.data;
    const userData={
      name:responseData.data.name,
      email:responseData.data.email,
      token:responseData.token
    }
    res.cookie("user", JSON.stringify(userData), {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect("/challenges");
  }
  catch(err){
    res.render("login.ejs",{
      formData:req.body,
      message:"ID or password is incorrect!"
    });
  }
})

function isLoggedIn(req, res, next) {
  if (req.cookies.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

// Logout Get  
app.get('/logout', (req, res) => {
  res.clearCookie('user');
  res.redirect("/login");
});


// Challenges Get 
app.get("/challenges",isLoggedIn,async (req,res)=>{
  try{
    const respose = await db.query("select to_char(starttime,'DD MON YY HH:MI:SS AM') starttimeformat,challenges.name,problems.image,questionid,starttime,duration,(starttime + duration * interval '1 minute') endtime from challenges inner join problems on problems.id=challenges.questionId WHERE starttime + duration * interval '1 minute' > NOW();");
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
app.get("/play/:cid",isLoggedIn,async (req,res)=>{
  const challengeId=encodeURI(req.params.cid);
  const currDate=new Date();
  try{
    const respose = await db.query("select challenges.name name,problems.id id,problems.image image,problems.colors,starttime,duration,(starttime + duration * interval '1 minute') endtime from challenges inner join problems on challenges.questionid = problems.id WHERE challenges.name=$1;",[challengeId]);
    if(respose.rows.length==1){
      const challenge=respose.rows[0];
      if(challenge.starttime<= currDate && currDate <= challenge.endtime){
        const data={
          problemId:challenge.id,
          name:challenge.name,
          endTime:challenge.endtime,
          image:challenge.image,
          colors:challenge.colors.split(',')
        }
        res.render("play.ejs",{data});
      }
      else{//if not live
        res.render("message.ejs",{
          data:{
            heading:"❌ Challenge is not live now!",
            description:"The challenge you're trying to access hasn't started yet or completed. Keep an eye on this space and sharpen your CSS skills in the meantime. Get ready to join the battle once it goes live!"
          }
        });
      }
    }
    else//if challege not found
      res.render("message.ejs",{
        data:{
          heading:"❌ Challenge not found!!",
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

app.post("/play/:cid",isLoggedIn,async (req,res)=>{
  const cid=encodeURI(req.params.cid);
  const user=JSON.parse(req.cookies.user);
  
  try{
    const timeLeft=await db.query("select (starttime+(duration * interval '1 minute') + interval '2 minute')>=NOW() possible from challenges where name=$1;",[cid]);
    if(timeLeft.rows[0].possible){
      try{
        await db.query("insert into css_submission(cid,user_email,user_name,match_percentage,code) values($1,$2,$3,$4,$5) RETURNING id;",[cid,user.email,user.name,req.body.match,req.body.code]);
        res.sendStatus(202);
      }
      catch(err){
        res.sendStatus(422);
      }
    }
    else
      res.redirect(req.get('Referer'));
  } 
  catch(err){
    console.log(err);
  }
})


//AdminPanel
app.get('/adminpanel', isAdminLoggedIn,(req, res) => {
  res.render("adminpanel/home.ejs");
});



// Login Get 
app.get("/adminpanel/login",(req,res)=>{
  res.render("adminpanel/login.ejs",{
    formData:{
      email:"",
      password:""
    }
  });
})

// Login Post
app.post("/adminpanel/login",async (req,res)=>{
  const user = req.body;
  if(user.email==process.env.ADMIN_EMAIL && user.password==process.env.ADMIN_PASSWORD){
    res.cookie("admin", JSON.stringify(user), {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect("/adminpanel");
  }
  else{
    res.render("adminpanel/login.ejs",{
      formData:req.body,
      message:"ID or password is incorrect!"
    });
  }
})

function isAdminLoggedIn(req, res, next) {
  if (req.cookies.admin) {
    const admin=JSON.parse(req.cookies.admin);
    if(admin.email==process.env.ADMIN_EMAIL && admin.password==process.env.ADMIN_PASSWORD)
      next()
    else
      res.redirect("/adminpanel");
  }
  else
    res.render("adminpanel/login.ejs");
}

// Logout Get  
app.get('/adminpanel/logout', (req, res) => {
  res.clearCookie('admin');
  res.redirect("/adminpanel/login");
});




app.get('/adminpanel/problems',isAdminLoggedIn,async (req, res) => {
  try{
    const respose = await db.query("SELECT id,name,colors,image FROM problems");
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

app.get('/adminpanel/challenges',isAdminLoggedIn,async (req, res) => {
  try{
    const respose = await db.query("select c.name,p.id problemId,p.name problemName,starttime,duration,p.image from challenges c inner join problems p on c.questionid=p.id;");
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
app.get('/adminpanel/submission/:cid',isAdminLoggedIn,async (req, res) => {
  const cid=encodeURI(req.params.cid);
  try{
    const respose = await db.query("select *,to_char(submission_time,'DD MON YY HH:MI:SS AM') format_submission_time from css_submission where cid=$1 order by match_percentage desc,submission_time asc",[cid]);
    res.render("adminpanel/submission.ejs",{
      data:{
        name:decodeURI(cid),
        records:respose.rows
      }
    });
  }
  catch(err){
    res.render("message.ejs",{
      data:{
        heading:"❌ Cannot get Submissions!",
        description:err.detail,
        button:{
          link: "/adminpanel", 
          text: "Admin Panel"
        }
      }
    });
  }
});
app.get('/adminpanel/create-challenge',isAdminLoggedIn,async (req, res) => {
  try{
    const respose = await db.query("SELECT id,name,image FROM problems");
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

app.post('/adminpanel/create-challenge',isAdminLoggedIn,async (req, res) => {
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

app.get('/adminpanel/create-problem',isAdminLoggedIn,async (req, res) => {
  res.render("adminpanel/create-problem.ejs");
});

app.post('/adminpanel/create-problem',isAdminLoggedIn,upload.single('image'),async (req, res) => {
  const data=req.body;
  try{
    const filename = req.file;
    await db.query("insert into problems(name,colors,image) values ($1,$2,$3);",[data.name,data.colors,filename.filename]);
    res.redirect("/adminpanel/problems");
  }
  catch(error){
    res.render("message.ejs",{
      data:{
        heading:"❌ Something went wrong!",
        description:error.detail,
        button:{
          link: "/adminpanel/create-problem", 
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