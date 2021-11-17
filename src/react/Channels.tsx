import React from 'react';
import { useState, useEffect, useRef } from "react";
import { urbitVisor } from "@dcspark/uv-core";
import { liveCheckPatp, addDashes, buildDM, buildChatPost, buildCollectionPost, buildNotebookPost } from "../utils/utils";
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
    filter?: any
    selected: UrbitKey[]
    setSelected: (keys) => void
}

export function ChannelSelectBox({ filter, selected, setSelected }: ChannelBoxProps) {


    useEffect(() => {
        readMetadata();
    }, []);

    async function readMetadata() {
        let sub: number;
        setLoading(true)
        const subscription = urbitVisor.on("sse", ["metadata-update", "associations"], async (data: any) => {
            const keys = await urbitVisor.scry({ app: "graph-store", path: "/keys" });
            setLoading(false)
            const list = keys.response["graph-update"].keys.map((channel: any) => referenceMetadata(channel, data));
            const channels = list.filter(chan => chan.name !== "dm-inbox" && chan.group !== "");
            console.log(list, "list")
            if (filter === "collections") setChannels(channels.filter(chan => chan.type !== "links"));
            else setChannels(channels);
            setOptions(channels);
            setLoading(false);
            urbitVisor.unsubscribe(sub).then(res => console.log(res, "unsubscribed"))
        });
        urbitVisor.subscribe({ app: "metadata-store", path: "/all" }).then(res => sub = res.response);

    }
    const inputRef = useRef();
    const [input, setInput] = useState("");
    const [channels, setChannels] = useState<UrbitChannel[]>([]);
    const [dms, setDMs] = useState([]);
    const [dmCandidate, setDMCandidate] = useState<string>(null);
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState(channels);

    async function handleClick() {
        // for (let channel of selected) {
        //     let data;
        //     console.log(channel, "channel")
        //     if (channel.group === "DM") data = buildDM(ship, channel.name, payload.contents)
        //     else if (channel.type === "publish") data = buildNotebookPost(ship, channel, "Urbit Visor Share", payload.contents)
        //     else if (channel.type === "link") data = buildCollectionPost(ship, channel, "Urbit Visor Share", payload.contents)
        //     else if (channel.type === "chat") data = buildChatPost(ship, channel, payload.contents)
        //     console.log(data, "data")
        //     const res = await urbitVisor.poke(data);
        //     console.log(res, "poked")
        // }
    }



    function handleChange(e) {
        const inp = e.target.value.toLowerCase();
        e.target.style.width = `${inp.length + 5}ch`
        setInput(e.target.value);
        if (inp.length > 0) {
            if (inp[0] === "~") {
                const validPatp = liveCheckPatp(inp);
                if (validPatp) setDMCandidate(inp.replace(/-+$/, ''));
                else setDMCandidate(null);
            } else {
                setDMCandidate(null);
                const filtered = channels.filter(chan => {
                    return (
                        chan.name.includes(inp) ||
                        chan.group.includes(inp) ||
                        chan.title.includes(inp) ||
                        chan.ship.includes(inp)
                    )
                })
                setOptions([...dms, ...filtered]);
            }
        } else {
            setOptions([...dms, ...channels])
        }
    }

    function addDM(){
        const patp = dmCandidate;
        const data = {
            group: "Direct Messages",
            name: "dm",
            ship: patp,
            title: patp,
            type: "DM",
        }
        const set = [data, ...dms.filter(dm => dm.ship !== patp)];
        setDMs(set)
        setOptions([data, ...options.filter(dm => dm.ship !== patp)]);
    }

    function select(key) {
        if (key.group === "DM") setInput("");
        console.log(key, "selected key")
        setSelected([...selected, key]);
    }

    function unselect(key) {
        const newlist = selected.filter(k => !(k.ship === key.ship && k.name === key.name));
        setSelected(newlist);
    }
    function focusOnInput(){
        inputRef.current.focus();
    }
    console.log(selected, "selected")



    return (
        <div id="uv-channel-selector">
            <div id="uv-channel-selector-title">
                <h4>Select Channels ({selected.length}/{channels.length})</h4>
            </div>
            <div id="uv-channel-selector-searchbox">
                <div onClick={focusOnInput} id="uv-channel-selector-searchbox-wrapper">
                    <input ref={inputRef} placeholder="Search channels or DMs" onChange={handleChange} value={input} type="text" />
                    {dmCandidate && <button onClick={addDM} className="dm-candidate-chip">{dmCandidate}</button>}
                </div>
            </div>
            <div id="urbit-key-container">
                {loading && <p>... loading ...</p>}
                {options.map((k, index) => {
                    const key = `${k.ship}/${k.name}`;
                    return <UrbitKey key={key} keyString={key} select={select} unselect={unselect} metadata={k} />
                })}
            </div>
        </div>);

}

export default ChannelSelectBox
interface UrbitKeyProps {
    key: string
    keyString: string
    metadata: any
    select: (key) => void
    unselect: (key) => void
}
function UrbitKey({ keyString, metadata, select, unselect }: UrbitKeyProps) {
    function handleSelect(e) {
        const key: UrbitKey = { ship: metadata.ship, name: metadata.name }
        if (e.target.checked) select(key)
        else unselect(key)
    }
    const chatIcon = <svg color="black" display="block" viewBox="0 0 16 16"><path d="M10.8571 12.2918L11.014 11.817L10.7959 11.745L10.5991 11.8635L10.8571 12.2918ZM12.2857 10.8623L11.8645 10.5929L11.7358 10.7942L11.8115 11.0207L12.2857 10.8623ZM13 13L12.8431 13.4747C13.0228 13.5341 13.2206 13.487 13.3541 13.353C13.4877 13.219 13.5342 13.021 13.4742 12.8415L13 13ZM10.5991 11.8635C9.94405 12.2582 8.87909 12.5 8 12.5V13.5C9.00806 13.5 10.2645 13.2326 11.1152 12.7201L10.5991 11.8635ZM8 12.5C5.51471 12.5 3.5 10.4853 3.5 8.00004H2.5C2.5 11.0376 4.96244 13.5 8 13.5V12.5ZM3.5 8.00004C3.5 5.51475 5.51472 3.5 8 3.5V2.5C4.96242 2.5 2.5 4.96247 2.5 8.00004H3.5ZM8 3.5C10.4853 3.5 12.5 5.51475 12.5 8.00004H13.5C13.5 4.96247 11.0376 2.5 8 2.5V3.5ZM12.5 8.00004C12.5 8.93552 12.2914 9.92518 11.8645 10.5929L12.707 11.1316C13.2729 10.2465 13.5 9.046 13.5 8.00004H12.5ZM10.7002 12.7665L12.8431 13.4747L13.1569 12.5253L11.014 11.817L10.7002 12.7665ZM13.4742 12.8415L12.7599 10.7038L11.8115 11.0207L12.5258 13.1585L13.4742 12.8415Z"></path></svg>
    const notebookIcon = <svg color="black" display="block" viewBox="0 0 16 16"><path fillRule="evenodd" clipRule="evenodd" d="M3.1001 1.8999H11.6001C12.7599 1.8999 13.7001 2.8401 13.7001 3.9999V11.1999C13.7001 12.3597 12.7599 13.2999 11.6001 13.2999H6.5001V13.9999H5.5001V13.2999H3.1001V1.8999ZM6.5001 12.2999H11.6001C12.2076 12.2999 12.7001 11.8074 12.7001 11.1999V3.9999C12.7001 3.39239 12.2076 2.8999 11.6001 2.8999H6.5001V12.2999ZM5.5001 2.8999V12.2999H4.1001V2.8999H5.5001ZM11.2001 6.0999H8.0001V5.0999H11.2001V6.0999Z"></path></svg>
    const collectionIcon = <svg color="black" display="block" viewBox="0 0 16 16"><path fillRule="evenodd" clipRule="evenodd" d="M2 2H14V6H13V12.5C13 13.3284 12.3284 14 11.5 14H4.5C3.67157 14 3 13.3284 3 12.5V6H2V2ZM3 5H4V12.5C4 12.7761 4.22386 13 4.5 13H11.5C11.7761 13 12 12.7761 12 12.5V5H13V3H3V5ZM9.5 9H6.5V8H9.5V9Z"></path><path fillRule="evenodd" clipRule="evenodd" d="M12.5 6H3.5V5H12.5V6Z"></path></svg>
    const feedIcon = <svg color="black" display="block" viewBox="0 0 16 16"><path fillRule="evenodd" clipRule="evenodd" d="M6 3H3L3 6H6V3ZM3 2C2.44772 2 2 2.44772 2 3V6C2 6.55228 2.44772 7 3 7H6C6.55228 7 7 6.55228 7 6V3C7 2.44772 6.55228 2 6 2H3Z"></path><path fillRule="evenodd" clipRule="evenodd" d="M13 3H10L10 6H13V3ZM10 2C9.44772 2 9 2.44772 9 3V6C9 6.55228 9.44772 7 10 7H13C13.5523 7 14 6.55228 14 6V3C14 2.44772 13.5523 2 13 2H10Z"></path><path fillRule="evenodd" clipRule="evenodd" d="M13 10H10L10 13H13V10ZM10 9C9.44772 9 9 9.44772 9 10V13C9 13.5523 9.44772 14 10 14H13C13.5523 14 14 13.5523 14 13V10C14 9.44772 13.5523 9 13 9H10Z"></path><path fillRule="evenodd" clipRule="evenodd" d="M6 10H3L3 13H6V10ZM3 9C2.44772 9 2 9.44772 2 10V13C2 13.5523 2.44772 14 3 14H6C6.55228 14 7 13.5523 7 13V10C7 9.44772 6.55228 9 6 9H3Z"></path></svg>
    const dmIcon = <svg color="black" viewBox="0 0 16 16"><path fillRule="evenodd" clipRule="evenodd" d="M13.2894 13.0305L13.603 12.6115C13.9633 12.1301 14.1763 11.5339 14.1763 10.885C14.1763 9.29167 12.8846 8 11.2913 8C9.69792 8 8.40625 9.29167 8.40625 10.885C8.40625 12.4784 9.69792 13.77 11.2913 13.77C11.7632 13.77 12.2059 13.6575 12.5968 13.4587L12.9696 13.2691L13.4189 13.4189L13.2894 13.0305ZM14.8419 14.5257C14.907 14.7211 14.7211 14.907 14.5257 14.8419L13.0501 14.35C12.522 14.6186 11.9243 14.77 11.2913 14.77C9.14563 14.77 7.40625 13.0307 7.40625 10.885C7.40625 8.73938 9.14563 7 11.2913 7C13.4369 7 15.1763 8.73938 15.1763 10.885C15.1763 11.7572 14.8889 12.5623 14.4036 13.2107L14.8419 14.5257Z"></path><path fillRule="evenodd" clipRule="evenodd" d="M2.95245 9.37231L3.15819 9.75316L3.0213 10.1638L2.43629 11.9189L4.19133 11.3338L4.60198 11.197L4.98284 11.4027C5.68769 11.7835 6.49464 12 7.35515 12C7.4262 12 7.4969 11.9985 7.56722 11.9956C7.67016 12.3413 7.81992 12.6668 8.00914 12.9648C7.79434 12.9881 7.57614 13 7.35515 13C6.32463 13 5.35479 12.7402 4.50756 12.2825L2.041 13.1047L2.00153 13.1179L1.64572 13.2365L1.32949 13.3419C1.13405 13.407 0.948116 13.2211 1.01326 13.0257L1.11867 12.7094L1.23728 12.3536L1.25043 12.3141L2.07262 9.84759C1.61494 9.00035 1.35515 8.03052 1.35515 7C1.35515 3.68629 4.04144 1 7.35515 1C10.6689 1 13.3551 3.68629 13.3551 7C13.3551 7.1943 13.3459 7.38644 13.3279 7.576C13.0276 7.39079 12.7002 7.24531 12.353 7.14689C12.3544 7.0981 12.3551 7.04913 12.3551 7C12.3551 4.23858 10.1166 2 7.35515 2C4.59372 2 2.35515 4.23858 2.35515 7C2.35515 7.8605 2.57169 8.66745 2.95245 9.37231Z"></path></svg>
    let icon = chatIcon;
    if (metadata.type == "post") icon = feedIcon;
    if (metadata.type == "publish") icon = notebookIcon;
    if (metadata.type == "links") icon = collectionIcon;
    if (metadata.type == "DM") icon = dmIcon;
    return (
        <div className="urbit-key">
            <input onChange={handleSelect} type="checkbox" name={keyString} id={keyString} />
            <div className="urbit-key-name">
                <p className="urbit-key-title">{metadata.title}</p>
                <p className="urbit-key-group">in {metadata.group}</p>
            </div>
            <div className="urbit-key-type-icon">
                {icon}
            </div>
        </div>
    )
}