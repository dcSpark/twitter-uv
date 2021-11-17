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
    const [show, setShow] = useState(true);
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
    return (
        <div style={styles}>
            <ShareModal {...props} setShow={setShow} />
        </div>
    )
}


export default App;