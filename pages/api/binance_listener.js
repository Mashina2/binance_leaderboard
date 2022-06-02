import pnlManager from "binance-leaderboard-listener/libs/pnlManager";
// const encryptedUid = "E183C1EC8742EEDF845E581699D129E3";
const DELAY = 5000;


export default async function handler(req, res) {

    let listeners = await fetch("http://localhost:3000/api/mongo/get_listeners");
    listeners = await listeners.json();
    listeners = listeners.data;


    let listener_id;
    let listener_name;
    for (let i in listeners) {
        let list = listeners[i];
        if (list.isPrimary == true) {
            listener_id = list.encryptedUid;
            if(list.Name != undefined || list.Name != null)
            listener_name = list.Name;
        }
    }

    const listener = pnlManager.listen({
        encryptedUid: listener_id,
        delay: DELAY,
        tradeType: "PERPETUAL"
    })
    listener.on('update', (data) => {
        try{
            res.status(200).json({ data:data,name:listener_name });
        }
        catch(e){
        res.status(500).json({data:e,name:"some errors"});
        }
    });
  }
  