import express from "express";
import env from "dotenv";
import ejs from "ejs";
import bodyParser from "body-parser";

env.config();
const app = express();
const port = process.env.PORT||3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view-engine","ejs");


app.use(bodyParser.urlencoded({extended:true}));

app.get("/",(req,res)=>{
    res.render("hello.ejs");
})

app.get("/play",(req,res)=>{
  const data={
    challengeId:"c1",
    colors:["#5D3A3A","#B5E0BA"]
  }
    res.render("play.ejs",{data});
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
