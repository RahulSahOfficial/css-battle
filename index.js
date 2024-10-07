import express from "express";
import env from "dotenv";
import pg from "pg";
import ejs, { render } from "ejs";
import bodyParser from "body-parser";

env.config();
const app = express();
const port = process.env.PORT||3000;


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

app.get("/challenges",async (req,res)=>{
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
app.get("/play/:cid",async (req,res)=>{
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