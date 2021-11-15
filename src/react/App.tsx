import React from "react";
import {useEffect, useState} from "react";
import { urbitVisor } from "@dcspark/uv-core";
import Preview from "./Preview";
import Channels from "./Channels";
import "./styles.css";
import ReactDOM from "react-dom";
import Welcome from "./Welcome";



export interface TwitterProps{
    url: URL,
    id: number,
    screenshot: any
}

function App(props: TwitterProps){
    useEffect(()=>{
      checkPerms();
    });
    const [havePerms, setHavePerms] = useState(true);
    const [payload, setPayload] = useState(null);
    const [show, setShow] = useState(true);
    async function checkPerms(): Promise<void>{
        urbitVisor.on("permissions_granted", [], (perms) => setHavePerms(true));
        const res = await urbitVisor.authorizedPermissions();
        setHavePerms(res.response.length > 0)
    }
    console.log(show, "show")
    if (!show)
    ReactDOM.unmountComponentAtNode(document.getElementById("uv-twitter-extension-container"));
    const styles = {
      position: "fixed" as any,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgb(25, 25, 25, 0.9",
      display: "flex"
    }
    if (havePerms)
    return (
        <div style={styles}>
            <Preview {...props} setShow={setShow} setPayload={setPayload} />
            {payload && <Channels payload={payload} />}
        </div>
    )
    else return(
        <Welcome />
    )
}


export default App;