import React from 'react';
import ReactDOM from "react-dom";
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
            const list = keys.response["graph-update"].keys.map((channel: any) => referenceMetadata(channel, data))
            setChannels(list);
            setOptions(list);
            setLoading(false);
            urbitVisor.unsubscribe(sub).then(res => console.log(res, "unsubscribed"))
        });
        urbitVisor.subscribe({ app: "metadata-store", path: "/all" }).then(res => sub = res.response);

    }
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
    function addToSelection(channel: UrbitChannel) {
        if (selected.find(ek => ek.ship === channel.ship && ek.name === channel.name))
            setSelected(selected.filter(ek => ek.ship !== channel.ship || ek.name !== channel.name))
        else
            setSelected([...selected, channel])
    }
    console.log(selected, "selected")

    async function handleClick() {
        for (let channel of selected) {
            let data;
            console.log(channel, "channel")
            if (channel.group === "DM") data = buildDM(ship, dm.name, payload)
            else data = buildPost(ship, channel, payload)
            console.log(data, "data")
            const res = await urbitVisor.poke(data);
            console.log(res, "poked")
        }
    }

    const containerStyles = {
        display: "flex",
        maxWidth: "100%",
        flexWrap: "wrap" as any
    }

    function handleChange(e) {
        const input = e.target.value;
        if (input.length > 0) {
            if (input[0] === "~") {
                const patp = liveCheckPatp(input);
                if (patp) setDM({group: "DM", title: addDashes(input), name: addDashes(input), ship: addDashes(input)})
                else setDM(null)
            } else {
              const filtered = channels.filter(chan => {
                return (
                    chan.name.includes(input) ||
                    chan.group.includes(input) ||
                    chan.title.includes(input) ||
                    chan.ship.includes(input)
                )
              })
              setOptions(filtered);
            }

        } else {
            setOptions(channels)
        }
        console.log(input, "input");
    }

    const keyStyles = {
        padding: "0.5rem",
        marginRight: "5px",
        width: "47.5%",
        cursor: "pointer"
    }



    return (
        <div style={divStyles} className="uv-channel-selector">
            <div style={titleStyles} className="title">
                <img style={logoStyles} src="https://github.com/dcSpark/urbit-visor/raw/main/assets/visor-logo.png" alt="" />
                <p>Channel Selector</p>
            </div>
            <div className="searchbox">
                <p>Search channels or DMs</p>
                <input onChange={handleChange} type="text" />
                {dm && <Key add={addToSelection} channel={dm}/>}
            </div>
            {loading && <p>... loading ...</p>}
            <div style={containerStyles} className="key-container">
                {options.map((k, index) => {
                    return (
                        <div style={keyStyles} key={k.name} className="key-wrapper">
                            <Key add={addToSelection} channel={k} />
                        </div>
                    )
                })}
            </div>
            <button onClick={handleClick}>Share Tweet</button>
        </div>);

}
interface Keyprops {
    channel: UrbitChannel
    add: (key: UrbitChannel) => void,
}
function Key(props: Keyprops) {
    const [bold, setBold] = useState(false);

    const styles = {
        backgroundColor: lightbg,
        borderRadius: "1rem",
        border: bold ? "1px solid white" : "1px solid transparent",
        color: "white"
    }
    const className = bold ? "bold" : ""
    function select() {
        setBold(!bold);
        props.add(props.channel)
    }
    return (
        <p style={styles} onClick={select} className={className} > {props.channel.group} - {props.channel.title} </p>
    )
}

export default ChannelSelectBox
