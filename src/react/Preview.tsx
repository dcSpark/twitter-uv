import React from "react";
import { useEffect, useState } from "react";
import { TwitterProps } from "./App";
import { getTweet, getThread, Tweet, Poll } from "../api/client";
import { tweetToGraphStore, threadToGraphStore, pollOptions } from "../utils/parsing";



const placeholder = {
    author: {
        name: "",
        handle: "",
        avatar: ""
    },
    pics: [],
    time: "1d",
    video: null,
    text: "",
    quote: null,
    poll: null
}
// interface PreviewProps extends TwitterProps {
//     setPayload: (payload) => void
//     thread?: boolean
// }

interface PreviewProps {
    tweet: Tweet
}


function Preview({tweet}: PreviewProps) {
    // useEffect(() => {
    //     getThread(`${props.id}`).then(tweet => {
    //         console.log(tweet, "fetched tweet");
    //         setTweet(tweet.parent);
    //         const tweetcontents = tweetToGraphStore(tweet.parent);
    //         console.log(tweetcontents, "tweetcontents")
    //         const threadcontents = threadToGraphStore(tweet);
    //         console.log(threadcontents, "threadcontents")
    //         if (!props.thread) props.setPayload(tweetcontents);
    //         else props.setPayload(threadcontents);
    //     })
    // }, []);
    // const [tweet, setTweet] = useState<Tweet>(placeholder);

    return (
        <div id="tweet-preview">
            <div id="tweet-preview-author">
                <img id="avatar" src={tweet.author.avatar} alt="" />
                <p id="tweet-author-name">{tweet.author.name}</p>
                <p>@{tweet.author.handle}</p>
                <p>Posted: {tweet.time}</p>
            </div>
            <div id="tweet-body">
                <p id="tweet-text">{tweet.text}</p>
                {!tweet.video && tweet.pics.length > 0 && <Pics pics={tweet.pics} />}
                {tweet.video && <Video video={tweet.video} />}
                {tweet.poll && <Poll poll={tweet.poll} />}
                {tweet.quote && <Quote quote={tweet.quote} />}
            </div>
        </div>
    )
}

function Quote({ quote }) {
    return (
        <div id="tweet-quote">
            <div id="tweet-quote-author">
                <p id="tweet-quote-author-name">{quote.author.name}</p>
                <p id="tweet-quote-author-handle">@{quote.author.handle}</p>
                <p id="tweet-quote-time">{quote.time}</p>
            </div>
            <div id="tweet-quote-body">
                {quote.text}
                {!quote.video && quote.pics.length > 0 && <Pics pics={quote.pics} />}
                {quote.video && <Video video={quote.video} />}
                {quote.poll && <Poll poll={quote.poll} />}
            </div>
        </div>
    )
}

function Pics({ pics }) {

    return (
        <div id="tweet-pictures">
            {pics.map((pic, i) => {
                return (
                    <img key={i} className={`img-${pics.length}`} src={pic} alt="" />
                )
            })}
        </div>
    )
}

function Video({ video }) {
    return (
        <div id="tweet-video">
            <video preload="none" playsInline controls src={video}></video>
        </div>
    )
}

function Poll({ poll }) {
    const options = pollOptions(poll);

    return (
        <div id="twitter-poll">
            {options.map((opt, i) => {
                return (
                    <div key={i} className="twitter-poll-option">
                        <p>{opt.label}</p>
                        <p>{opt.count}</p>
                    </div>
                )
            })}
        </div>
    )
}

export default Preview;