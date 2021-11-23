import React from "react";
import {useEffect, useState} from "react";
import ShareModal from "./ShareModal";
import "./styles.css";
import ReactDOM from "react-dom";


export interface TwitterProps{
    url: URL,
    id: number,
    screenshot: any
}

function App(props: TwitterProps){
    const styles = {
      position: "fixed" as any,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgb(25, 25, 25, 0.9",
      display: "flex"
    }
    return (
        <div style={styles}>
            <ShareModal {...props}/>
        </div>
    )
}


export default App;