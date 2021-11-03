import React from "react";
import { useEffect, useState } from "react";
import { TwitterProps } from "./App";
import { getTweet, getThread, Tweet, Poll } from "../api/client";



const placeholder = {
    time: new Date(),
    author: {
        name: "dcSpark_io",
        handle: "dcSpark",
        avatar: ""
    },
    pics: [],
    video: null,
    text: "",
    quote: null,
    poll: null
}

function Preview(props: TwitterProps) {
    useEffect(() => {
        getThread(`${props.id}`).then(tweet => setTweet(tweet))
    }, []);
    const [tweet, setTweet] = useState<Tweet>(placeholder);
    console.log(tweet, "preview component")
    const styles = {
        border: "1px solid white",
        backgroundColor: "black",
        color: "white"
    }
    return (
        <div id="tweet-preview" style={styles}>
            <p>You want to share:</p>
            <div id="author">
                <img src={tweet.author.avatar} alt="" />
                <p>{tweet.author.name}</p>
                <p>{tweet.author.handle}</p>
            </div>
            <div id="tweet">
                {tweet.text}
                {!tweet.video && tweet.pics.length > 0 && <Pics pics={tweet.pics} />}
                {tweet.video && <Video video={tweet.video} />}
                {tweet.poll && <Poll poll={tweet.poll} />}
            </div>
        </div>
    )
}

function Pics({ pics }) {
    const styles = {
      width: "100%",
      padding: "0.3rem",
      display: "flex",
      flexWrap: "wrap",
      textAlign: "center"
    }
    return (
        <div style={styles} id="tweet-pictures">
           {pics.map((pic, i) => {
               return(
                 <img className="tweet-picture" src={pic} alt="" />
               )
           })}
        </div>
    )
}

function Video({video}){
    return(
      <div id="tweet-video">
      <video preload controls src={video}></video>
      </div>
    )
}

function Poll({ poll }) {
    const labels = Object.keys(poll).filter(key => key.includes("label"));
    const options = labels.map(label => {
        const count = label.split("_label")[0] + "_count"
        return { label: poll[label], count: poll[count] }
    });
    console.log(options)

    const styles = {
        borderRadius: "14px",
        boder: "1px solid grey",
        margin: "0 1rem",
        padding: "0 1rem"
    }
    const optStyles = {
        display: "flex",
        justifyContent: "space-between"
    }
    return (
        <div style={styles} id="poll">
            {options.map(opt => {
                return(
                <div style={optStyles} className="tweet-poll-option">
                    <p>{opt.label}</p>
                    <p>{opt.count}</p>
                </div>
            )})}
        </div>
    )
}

export default Preview;