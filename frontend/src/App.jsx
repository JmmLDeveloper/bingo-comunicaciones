import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import socketContext from "./store/socketContext";
import SetName from "./routes/SetName";
import Game from "./routes/Game";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SetName />,
  },
  {
    path: "/game",
    element: <Game />,
  },

]);

function App() {
  const [socket, setSocket] = useState(null);
  const [onLobby,setOnLobby] = useState(false)
  const [ready, setReady] = useState(false);

  useEffect(() => {


    if (!socket) {
      const s = io("http://localhost:3000");
      s.on("connect", (info)=> {
        setReady(true)
        console.log('the connection has been established ',s.id)
      } );
      s.on('disconnect',()=>{
        console.log('the connection has been lost')
        window.location.href = '/'
      })
      setSocket(s);
    }

    return ()=> {
      if(socket) {
        socket.off('connect')
        socket.off('disconnect')

      }
    }

  }, []);

  if (!ready) {
    return (<div>loading socket</div>)
  } else {
    return (
      <socketContext.Provider value={{socket,onLobby,setOnLobby}}>
        <RouterProvider router={router} />
      </socketContext.Provider>
    );
  }
}

export default App;
