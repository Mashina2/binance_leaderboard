import { useEffect, useState } from "react";
import { getCookie } from "../helpers/cookieHandler";
import { useRouter } from 'next/router'


// Component Import Start
import Index from "./Index";
import Listeners from "./Listeners";
import OpenOrders from "./OpenOrders";
import CloseOrders from "./CloseOrders";
import OrderDetails from "./OrderDetails";

// Component Import Stop

export default function Parent(props) {
  const router = useRouter();

  let appWrapper = {
    Index: Index,
    Listeners:Listeners,
    OpenOrders:OpenOrders,
    CloseOrders:CloseOrders,
    OrderDetails:OrderDetails
  };
  let DefaultApp = appWrapper[getCookie("DefaultApp")] || (
    <Index  />
  );

  //   DefaultApp = <DefaultApp />;
  let [app, setApp] = useState(DefaultApp);

  // Helper Functions

  function IndexButton(e) {
    e.preventDefault();
    setApp(
      <Index
      />
    );
  }
  
  function ListenersButton(e) {
    e.preventDefault();
    setApp(
      <Listeners
      />
    );
  }
  function OpenOrdersButton(e) {
    e.preventDefault();
    setApp(
      <OpenOrders
      />
    );
  }
  function CloseOrdersButton(e) {
    e.preventDefault();
    setApp(
      <CloseOrders
      />
    );
  }

  // console.log(DefaultApp);
  return (
    <div>
      <input type="button" value="LeaderBoard" onClick={IndexButton} />
      <input type="button" value="Listeners" onClick={ListenersButton} />
      <input type="button" value="OpenOrders" onClick={OpenOrdersButton} />
      
      {/* <input type="button" value="CloseOrders" onClick={CloseOrdersButton} /> */}
      <div className="app_parent">{app}</div>
      <br />
    </div>
  );
}
