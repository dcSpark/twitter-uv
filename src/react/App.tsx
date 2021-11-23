import React from "react";
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
    useEffect(() => {
        checkPerms();
    }, [])
    const [havePerms, setHavePerms] = useState(false);
    const [loading, setLoading] = useState(true);

    async function checkPerms(): Promise<void> {
        urbitVisor.on("permissions_granted", [], (perms) => setHavePerms(true));
        const res = await urbitVisor.authorizedPermissions();
        console.log(res, "res")
        const ok = ["shipName", "scry", "subscribe", "poke"].every(perm => res.response.includes(perm))
        setHavePerms(ok);
        setLoading(false);
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