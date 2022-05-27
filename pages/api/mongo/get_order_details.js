import { ObjectID } from "bson";
import nextConnect from "next-connect";
import middleware from "./../../../middleware/database";
import { ObjectId } from "mongodb";

// Globals
const handler = nextConnect();
handler.use(middleware);

// API Handler
handler.post(async (req, res) => {
  let order_id = JSON.parse(req.body);
   
  await req.db.collection('order_details').find({orderId:ObjectId(order_id)}).toArray(function(err, result){
    if(err) throw err;
    
    res.status(200).json({data:result});
  });

});

export default handler;
