import nextConnect from "next-connect";
import middleware from "../../../middleware/database";
const handler = nextConnect();
handler.use(middleware);
handler.get(async (req, res) => {
await req.db.collection('leaderboard_uid').find({}).toArray(function(err, rest){
  let encryptedUid;
  for(let i in rest){
    if(rest[i].isPrimary == true) encryptedUid=rest[i].encryptedUid;
  }
  req.db.collection('orders').find({$and:[{encryptedUid:encryptedUid},{status:0}]}).toArray(function(err, result){
    if(err) throw err;
    let data = {};
    let uid = {};
    for(let i in result){
      data[result[i].symbol] = result[i];
      uid[result[i].encryptedUid] = result[i];
    }
    res.status(200).json({length:result.length,data:data,uid:uid});
  });
});
});
export default handler;
