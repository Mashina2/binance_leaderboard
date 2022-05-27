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

  console.log("change status data");
  console.log(body);

  // Get content collection
//   parentContent = await req.db
//     .collection(`leaderboard_uid`)
//     .findOne();

  if (req.method === "POST") {
      // Process a POST request
      let encryptedUid = body.encryptedUid;
      let isPrimary = body.isPrimary;

      let query =  { encryptedUid: encryptedUid }; 
      let status = { $set: {isPrimary : isPrimary } }
      let statuss = { $set: {isPrimary : false } }

    let updte = await req.db
      .collection(`leaderboard_uid`).updateOne(query,status,{ upsert: true });

  await req.db
      .collection(`leaderboard_uid`).updateMany({encryptedUid:{$ne:encryptedUid}},{$set:{isPrimary:false}});
      

      console.log("statussdfdf");
      console.log(updte);
      
      // console.log("body");
      // console.log(body);
      // parentContent.isPrimary = body.active;
      
      // console.log("parent content");
      // console.log(parentContent);
      // let updateDoc = await req.db
      //   .collection(`leaderboard_uid`)
      //   .replaceOne({}, parentContent, { upsert: true });

    res.status(200).json({ status: "Status Updated" });
  } else {
    // Handle any other HTTP method
    console.log("POST REQUESTS ONLY");
    res.status(200).json({ status: negRes });
  }
});

export default handler;
