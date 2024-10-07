import express from "express";
import env from "dotenv";
import pg from "pg";
import ejs from "ejs";
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
app.get("/play/:cid",async (req,res)=>{
  const challengeId=req.params.cid;
  try{
    const respose = await db.query("SELECT * FROM challenge WHERE id=$1",[challengeId]);
    if(respose.rows.length==1){
      const challenge=respose.rows[0];
      const data={
        challengeId:challenge.id,
        name:challenge.name,
        colors:challenge.colors.split(',')
      }
      res.render("play.ejs",{data});
    }
    else
      res.render("contest-not-found.ejs",{data});
  }
  catch(err){
    res.render("contest-not-found.ejs");
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});