import React from "react";
import { urbitVisor } from "@dcspark/uv-core";


function Welcome(){
    const styles = {
      position: "fixed" as any,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "500px",
      height: "500px",
      backgroundColor: "lightgrey",
      padding: "1rem"
    }
    async function requestPerms(): Promise<void>{
        await urbitVisor.requestPermissions(["shipName","scry", "subscribe", "poke"]);
    }
    return (
        <div style={styles}>
            <p>Welcome to the Urbit Visor Twitter Extension</p>
            <p>In order to use the extension you must first grant it permissions to scry, subscribe and read your Urbit ships' name.</p>
            <p>Click on the button below to request permissions, then click on your Urbit Visor extension icon to grant them.</p>
            <button onClick={requestPerms}>Request Permissions</button>
        </div>
    )
}


export default Welcome