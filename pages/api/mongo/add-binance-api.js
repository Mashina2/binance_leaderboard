import fs from "fs";
import nextConnect from "next-connect";
import middleware from "./../../../middleware/database";


const handler = nextConnect();
handler.use(middleware);

// API Handler
handler.post(async (req, res) => {
  let body = JSON.parse(req.body);
// console.log(req.body);


  if (req.method === "POST") {
    // console.log("binance_data "+body);
    await req.db
      .collection(`binance`)
      .replaceOne({}, body, { upsert: true });

    res.status(200).json({ status: `Api's Inserted` });
  } else {
    // Handle any other HTTP method
    console.log("POST REQUESTS ONLY");
    res.status(200).json({ status: negRes });
  }
});

export default handler;
