import fs from "fs";
import nextConnect from "next-connect";
import middleware from "./../../../middleware/database";

// Globals
let parentContent;
const handler = nextConnect();
handler.use(middleware);

// API Handler
handler.post(async (req, res) => {
    // console.log('test connection')
  let body = JSON.parse(req.body);
 
  if(body == 0){
      body = false;
  }
  else{
      body = true;
  }
// let body = req.body;
  // Get content collection
  if (req.method === "POST") {

    let query =  { isPrimary: true }; 
    let status = { $set: {enable : body } }
      await req.db
     .collection(`leaderboard_uid`).updateOne(query,status,{ upsert: true });

    res.status(200).json({ status: "Status changed" });
  } else {
    // Handle any other HTTP method
    console.log("POST REQUESTS ONLY");
    res.status(200).json({ status: negRes });
  }
});

export default handler;
