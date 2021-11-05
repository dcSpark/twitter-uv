import React from 'react';
import { useState, useEffect, useRef } from "react";
import { urbitVisor } from "@dcspark/uv-core";
import { liveCheckPatp, addDashes, buildDM, buildPost } from "../utils/utils";
interface UrbitKey {
    ship: string,
    name: string
}
interface UrbitChannel {
    title: string,
    type: "post" | "chat" | "link" | "publish" | null,
    group: string,
    ship: string,
    name: string
}



const bg = "rgb(25,35,31)"
const lightbg = "rgb(35,45,41)"
const borderColor = "rgb(40,51,45)"
function referenceMetadata(channel: any, metadata: any): UrbitChannel {
    const url: string | undefined = Object.keys(metadata).find(el => el.includes(`${channel.ship}/${channel.name}`));

    if (url) {
        const title = metadata[url].metadata.title;
        const type = metadata[url].metadata.config.graph;
        const group = metadata[url].group;
        const groupMetadata = metadata[`${group}/groups${group}`];
        console.log(groupMetadata, "group")
        const groupTitle = groupMetadata?.metadata?.title;
        return {
            title: title,
            type: type,
            group: groupTitle || channel.name,
            ship: channel.ship,
            name: channel.name
        }
    }
    else return { title: "", group: "", type: null, ship: channel.ship, name: channel.name }
}

interface ChannelBoxProps {
    payload: string
}

export function ChannelSelectBox({ payload }: ChannelBoxProps) {


    useEffect(() => {
        readMetadata();
    }, []);

    async function readMetadata() {
        let sub: number;
        setLoading(true)
        const subscription = urbitVisor.on("sse", ["metadata-update", "associations"], async (data: any) => {
            const shipName = await urbitVisor.getShip();
            console.log(shipName, "ship");
            setShip(shipName.response);
            const keys = await urbitVisor.scry({ app: "graph-store", path: "/keys" });
            setLoading(false)
            const list = keys.response["graph-update"].keys.map((channel: any) => referenceMetadata(channel, data));
            const channels = list.filter(chan => chan.name !== "dm-inbox");
            console.log(list, "list")
            setChannels(channels);
            setOptions(channels);
            setLoading(false);
            urbitVisor.unsubscribe(sub).then(res => console.log(res, "unsubscribed"))
        });
        urbitVisor.subscribe({ app: "metadata-store", path: "/all" }).then(res => sub = res.response);

    }
    const [input, setInput] = useState("");
    const [filtering, setFiltering] = useState(false);
    const [channels, setChannels] = useState<UrbitChannel[]>([]);
    const [selected, setSelected] = useState<UrbitKey[]>([]);
    const [loading, setLoading] = useState(false);
    const [ship, setShip] = useState("");
    const [dm, setDM] = useState(null);
    const [options, setOptions] = useState(channels);

    const divStyles = {
        width: "1000px",
        margin: "1rem auto",
        borderRadius: "1rem",
        padding: "1rem",
        backgroundColor: bg,
        overflow: "auto",
        color: "white"
    }
    const logoStyles = {
        width: "100px"
    }
    const titleStyles = {
        margin: "auto",
        textAlign: "center" as "center",
    }


    async function handleClick() {
        for (let channel of selected) {
            let data;
            console.log(channel, "channel")
            if (channel.group === "DM") data = buildDM(ship, channel.name, payload)
            else data = buildPost(ship, channel, payload)
            console.log(data, "data")
            const res = await urbitVisor.poke(data);
            console.log(res, "poked")
        }
    }



    function handleChange(e) {
        const inp = e.target.value.toLowerCase();
        setInput(e.target.value);
        if (inp.length > 0) {
            if (inp[0] === "~") {
                setFiltering(false);
                const patp = liveCheckPatp(inp);
                if (patp) setDM({ group: "DM", title: addDashes(inp), name: addDashes(inp), ship: addDashes(inp) })
                else setDM(null)
            } else {
                setFiltering(true);
                const filtered = channels.filter(chan => {
                    return (
                        chan.name.includes(inp) ||
                        chan.group.includes(inp) ||
                        chan.title.includes(inp) ||
                        chan.ship.includes(inp)
                    )
                })
                setOptions(filtered);
            }

        } else {
            setFiltering(false);
            setOptions(channels)
        }
    }

    function select(key) {
        const newchans = channels.filter(k => !(k.group === key.group &&　k.name === key.name));
        const newlist = options.filter(k => !(k.group === key.group &&　k.name === key.name));
        setChannels(newchans);
        setOptions(newlist);
        setDM(null);
        if (key.group === "DM") setInput("");
        setSelected([...selected, key]);
    }

    function unselect(key) {
        const newlist = selected.filter(k => !(k.group === key.group && k.name === key.name));
        setSelected(newlist);
        setOptions([...options, key]);
        setChannels([...channels, key]);
    }

    const containerStyles = {
        display: "flex",
        maxWidth: "100%",
    }
    const keyStyles = {
        margin: "10px",
        cursor: "pointer",
        padding: "0.5rem",
        backgroundColor: lightbg,
        borderRadius: "1rem",
        border: "1px solid transparent",
        color: "white"
    }


    console.log(options, "options");
    console.log(dm, "dm");
    console.log(input, "input")



    return (
        <div style={divStyles} className="uv-channel-selector">
            <div style={titleStyles} className="title">
                <img style={logoStyles} src="https://github.com/dcSpark/urbit-visor/raw/main/assets/visor-logo.png" alt="" />
                <p>Channel Selector</p>
            </div>
            <div className="searchbox">
                <p>Search channels or DMs</p>
                <div className="row2">
                    <input onChange={handleChange} value={input} type="text" />
                    <p>
                        {dm && "Send DM to:"}
                    </p>
                    {dm && <p onClick={()=> select(dm)} style={keyStyles}>{dm.name}</p>}
                </div>
                {filtering && <p>Filtering channels...</p>}
            </div>
            <div style={containerStyles} className="keys">

                <div className="key-container">
                    {loading && <p>... loading ...</p>}
                    {!loading && <p>Choose a channel to share the Tweet:</p>}
                    {options.map((k, index) => {
                        const string = k.title.length ? `${k.group} - ${k.title}` : k.name
                        return (
                            <p style={keyStyles} key={string} onClick={() => select(k)}> {string}</p>
                        )
                    })}
                </div>
                <div className="key-container selected-container">
                    <p>Share Tweet to:</p>
                    {selected.map((k, index) => {
                        const string = k.title.length ? `${k.group} - ${k.title}` : k.name
                        return (
                            <p onClick={() => unselect(k)} style={keyStyles} key={string} > {string}</p>
                        )
                    })}
                    <button onClick={handleClick}>Send</button>
                </div>
            </div>

        </div>);

}

export default ChannelSelectBox
