import React from "react";
import {useEffect, useState} from "react";
import { urbitVisor } from "@dcspark/uv-core";
import Preview from "./Preview";
import Channels from "./Channels"

export interface TwitterProps{
    url: URL,
    id: number
}

function App(props: TwitterProps){
    console.log(props, "muh props")
    const styles = {
      position: "fixed" as any,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgb(25, 25, 25, 0.9",    
    }
    const fn = () => console.log('haha')
    return (
        <div style={styles}>
            <Preview {...props} />
        </div>
    )
}


export default App;