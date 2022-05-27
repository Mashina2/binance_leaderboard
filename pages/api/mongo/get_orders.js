import nextConnect from "next-connect";
import middleware from "../../../middleware/database";
const handler = nextConnect();
handler.use(middleware);
handler.get(async (req, res) => {
 await req.db.collection('orders').find({}).toArray(function(err, result){
    if(err) throw err;
    let data = {};
    for(let i in result){
      data[result[i].symbol] = result[i];
    }
    res.status(200).json({length:result.length,data:data});
  });
});
export default handler;
