

import { useEffect ,useState} from "react";

function datetime(t) {
  // var dt = new Date(t*1000);
  var tm = new Date(t);

  var day = tm.getDate();
  if (day < 10) {
      day = "0" + day;
  }
  var month = tm.getMonth() + 1;
  if (month < 10) {
      month = "0" + month;
  }
  var year = tm.getFullYear();
  var hr = tm.getHours();
  if (hr < 10) {
      hr = "0" + hr;
  }
  var m = "0" + tm.getMinutes();
  var s = "0" + tm.getSeconds();
  return year + "-" + month + "-" + day + " " + hr + ':' + m.substr(-2) + ':' + s.substr(-2);
}

export default function Index() {
  let [listener_data,setListnerData] = useState();
  // useEffect(() => {
    // (async () => {
    //   async function refreshListener() {
    //   let res = await fetch("/api/binance_listener");
    //   res = await res.json();
    //   let arr = [];
    //   for (let i in res.data) {
    //     let dat = res.data[i];
    //     arr.push(
    //       <tr
    //           className="w3-animate-bottom"
    //           key={dat.symbol}
    //       >
            
    //               <td>{dat.symbol}</td>
    //               <td>{dat.entryPrice} </td>
    //               <td>{dat.markPrice} </td>
    //               <td>{dat.pnl.toFixed(2)} ({dat.roe.toFixed(4)} % ) </td>
    //               <td >{dat.amount}</td>
    //               <td>{datetime(dat.updateTimeStamp)}</td>
    //             </tr>
    //     );
    //   }

    //   setListnerData(arr);
    // }
//  useEffect(() => {
//     (async () => {
//       refreshListener();
//     })();
//     // let timer;
//     // timer = setInterval(async () => {
//     //   refreshListener();
//     // }, 15000);
//     // return () => clearTimeout(timer);
//   }, []);

        return (
        <div className="container">
            <h1 className="text-center">Binance LeaderBoard</h1>
            <div className="table-responsive">
            <table
            className="table"
            >
            <thead>
                <tr>
                <th>Symbol</th>
                <th>Entry Price</th>
                <th>Mark Price</th>
                <th>PNL (ROE %)</th>
                <th>Amount</th>
                <th>Time</th>
                </tr>
            </thead>
            {/* <tbody>{listener_data}</tbody> */}
            </table>
            </div>
        </div>
        );
}