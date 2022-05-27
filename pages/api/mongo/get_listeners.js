import nextConnect from "next-connect";
import middleware from "../../../middleware/database";
const handler = nextConnect();
handler.use(middleware);
handler.get(async (req, res) => {
 await req.db.collection('leaderboard_uid').find({}).toArray(function(err, result){
    if(err) throw err;
    res.status(200).json({data:result});
  });
});
export default handler;
