import React from "react";
import { unmountComponentAtNode } from "react-dom";
import { useEffect, useState } from "react";
import ShareModal from "./ShareModal";
import Welcome from "./Welcome";
import "./styles.css";
import { urbitVisor } from "@dcspark/uv-core";


export interface TwitterProps {
    url: URL,
    id: number,
    screenshot: any
}

function App(props: TwitterProps) {
    const styles = {
        position: "fixed" as any,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgb(25, 25, 25, 0.9",
        display: "flex"
    }
    const [havePerms, setHavePerms] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        checkPerms();
    }, [havePerms])


    async function checkPerms(): Promise<void> {
        urbitVisor.on("permissions_granted", [], (perms) => {
        console.log(perms, "perms read")
        setHavePerms(true)}
        );
        const res = await urbitVisor.authorizedPermissions();
        if (res.status === "locked")  unmountComponentAtNode(document.getElementById("uv-twitter-extension-container"));
        else {
          const ok = ["shipName", "scry", "subscribe", "poke"].every(perm => res.response.includes(perm))
          setHavePerms(ok);
          setLoading(false);
        }
    }
    if (loading) return (
    <div>...</div>
    )
    if (havePerms)
        return (
            <div style={styles}>
                <ShareModal {...props} />
            </div>
        )
    else
        return (
            <div style={styles}>
                <Welcome />
            </div>
        )
}


export default App;