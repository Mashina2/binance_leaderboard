import nextConnect from "next-connect";
import middleware from "../../../middleware/database";
const handler = nextConnect();
handler.use(middleware);
handler.get(async (req, res) => {
    var myquery = { encryptedUid: "E183C1EC8742EEDF845E581699D129E3" };
    await req.db.collection('orders').deleteMany(myquery, function (err, obj) {
        if (err) throw err;
        console.log(" document(s) deleted");
        // db.close();
    });
    var myquery = { type: "Buy"};
    await req.db.collection('order_details').deleteMany(myquery, function (err, obj) {
        if (err) throw err;
        console.log(" document(s) deleted");
        // db.close();
        res.json("document deleted");
    });
});
export default handler;
