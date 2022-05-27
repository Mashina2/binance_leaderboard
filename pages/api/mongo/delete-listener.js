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
//   let body = req.body;

  console.log("delete request");
  console.log(body);

  // Get content collection
  parentContent = await req.db
    .collection(`leaderboard_uid`)
    .findOne();

  if (req.method === "POST") {
    // Process a POST request

    // delete parentContent;

    let encryptedUid = body.encryptedUid
    let data =  { encryptedUid: encryptedUid };        
    await req.db
      .collection(`leaderboard_uid`).deleteOne(data);
    // let updateDoc = await req.db
    //   .collection(`leaderboard_uid`)
    //   .replaceOne({}, parentContent, { upsert: true });

    res.status(200).json({ status: "Deleted" });
  } else {
    // Handle any other HTTP method
    console.log("POST REQUESTS ONLY");
    res.status(200).json({ status: negRes });
  }
});

export default handler;
