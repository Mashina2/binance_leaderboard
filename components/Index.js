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
  let [getHeader,setHeader] = useState();
  let [getStatus,setStatus] = useState();

    async function enableDisableTrade(e){
      e.preventDefault();
      if(confirm("Are You sure want to change status")){
        let current_status = e.target.id;
       await fetch("/api/mongo/enable_disableTrade",{
          method:"POST",
          body:JSON.stringify(current_status)
        }).then(res=>{
          console.log("enable disable result"+ res);
          window.location.reload();
        }).catch(err=>{
          console.log("enable disable error"+err);
          window.location.reload();
        });
      }
      
  }

  // useEffect(() => {
  //   (async () => {
  //     let res = await fetch("/api/binance_listener");
  //     res = await res.json();
  //    })();
  // });
  // useEffect(() => {
    // (async () => {
      async function refreshListener() {
      let res = await fetch("/api/binance_listener");
      res = await res.json();

      //get all db listeners ids

      let list = await fetch("/api/mongo/get_listeners");
      list = await list.json();
        list = list.data;
        let status;
      for(let j in list){
        let listener = list[j];
        if(listener.isPrimary == true){
          status = listener.enable;
        }
      }
      setStatus(status);

      let arr = [];
      let totalPnl = 0;
      let listener_name = res.name;
      console.log("listener_name "+listener_name);

      setHeader(listener_name);

  

      for (let i in res.data) {
        let dat = res.data[i];
        var pnl  = dat.pnl;
       
       
        totalPnl += parseFloat(pnl);

        arr.push(
          <tr
              className="w3-animate-bottom"
              key={dat.symbol}
          >
            
                  <td>{dat.symbol}</td>
                  <td>{dat.entryPrice} </td>
                  <td>{dat.markPrice} </td>
                  <td>{dat.pnl.toFixed(2)} ({dat.roe.toFixed(4)} % ) </td>
                  <td >{dat.amount}</td>
                  <td>{datetime(dat.updateTimeStamp)}</td>
                </tr>
        );
       
      }
      arr.push(
        <tr>
          <td>Total PNL</td>
          <td colSpan={2}></td>
          <td>{totalPnl.toFixed(2)}</td>
          <td colSpan={2}></td>
        </tr>
      )

      setListnerData(arr);
    }
 useEffect(() => {
    (async () => {
      refreshListener();
    })();
    let timer;
    timer = setInterval(async () => {
      refreshListener();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

        return (
        <div className="container">
          
            <div className="mt-2" >
              <button type="button" id={getStatus == true ? 0:1} className={getStatus == true ? 'btn btn-danger btn-sm mb-5 float-right':'btn btn-success btn-sm mb-5 float-right'}  onClick={enableDisableTrade}>{getStatus == true ? 'Disable Trade':'Enable Trade'}</button>
            </div>
            <h1 className="text-center mt-5" id="header">Binance Leaderboard {getHeader}</h1>
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
            <tbody>{listener_data}</tbody>
            </table>
            </div>
        </div>
        );
}