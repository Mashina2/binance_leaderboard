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
// let body = req.body;
body = [body];

  // Get content collection

  if (req.method === "POST") {

    let updateDoc = await req.db
      .collection(`leaderboard_uid`)
      .insertMany( body, { upsert: true });

    res.status(200).json({ status: "Inserted" });
  } else {
    // Handle any other HTTP method
    console.log("POST REQUESTS ONLY");
    res.status(200).json({ status: negRes });
  }
});

export default handler;
