import React from "react";
import { useEffect, useState } from "react";
import { TwitterProps } from "./App";
import { urbitVisor } from "@dcspark/uv-core";

import Preview from "./Preview";
import Channels from "./Channels";

interface ModalProps extends TwitterProps {
    setShow: (boolean: boolean) => void
}
interface UrbitKey {
    ship: string,
    name: string
}
export default function ShareModal(props: ModalProps) {
    useEffect(()=>{
        urbitVisor.getShip().then(res => setShip(res.response))
    })
    const linkOnly = <div id="twitter-link"><p>{props.url.href}</p></div>

    console.log(props, "share modal running")
    const [payload, setPayload] = useState(props.url.href);
    const [preview, setPreview] = useState(linkOnly);
    const [ship, setShip] = useState<string>(null);
    const [selected, setSelected] = useState<UrbitKey[]>([]);


    function quit() {
        props.setShow(false);
    }
    const fullTweet = <Preview {...props} setPayload={setPayload} />;

    function setFullTweet() {
        setPreview(fullTweet);
    }
    function setLinkOnly() {
        setPreview(linkOnly);
        setPayload(props.url.href);
    }
    function setUnroll() {

    }
    function shareTweet() {
        console.log(preview, "payloood")
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
    return (
        <div id="uv-twitter-share-modal">
            <div id="tweet-preview-header">
                <p onClick={quit} id="preview-close-button">X</p>
                <h3>Share via Urbit</h3>
                <img id="visor-icon" src="https://urbit.s3.urbit.cloud/mirtyl-wacdec/2021.11.17..04.05.54-visor.png" alt="" />
            </div>
            <div id="tweet-preview-tabs">
                <div onClick={setFullTweet} className="tweet-preview-tab">
                    <h4>Full Tweet</h4>
                </div>
                <div onClick={setLinkOnly} className="tweet-preview-tab">
                    <h4>Link Only</h4>
                </div>
                <div onClick={setUnroll} className="tweet-preview-tab">
                    <h4>Unroll Thread</h4>
                </div>
            </div>
            <div id="tweet-share-payload-wrapper">
                <div id="tweet-share-payload">
                    {preview}
                </div>
            </div>
            <Channels selected={selected} setSelected={setSelected}/>
            <div id="tweet-share-button-wrapper">
            <button onClick={shareTweet} id="tweet-share-button">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="13" fill="white" stroke="currentcolor" strokeWidth="2" />
                    <path d="M22 14.0488H19.6306C19.4522 15.0976 18.9936 15.7317 18.1783 15.7317C16.7006 15.7317 15.8599 14 13.5669 14C11.3503 14 10.1783 15.3659 10 17.9756H12.3694C12.5478 16.9024 13.0064 16.2683 13.8471 16.2683C15.3248 16.2683 16.1146 18 18.4586 18C20.6242 18 21.8217 16.6341 22 14.0488Z" fill="black" />
                </svg>
                <p>Share</p>
            </button>
            </div>
        </div>
    )

}