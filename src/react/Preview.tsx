import React from "react";
import { useEffect, useState } from "react";
import { TwitterProps } from "./App";
import { getTweet, getThread, Tweet, Poll } from "../api/client";



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
interface PreviewProps extends TwitterProps {
    setPayload: (payload) => void
    setShow: (boolean: boolean) => void
}

function tweetToText(tweet: Tweet) {
    const url = `https://twitter.com/${tweet.author.handle}/statuses/${tweet.index}`
    const contents = [];
    const text = `
    Urbit Visor Presents: 
    [Tweet by ${tweet.author.name} (@${tweet.author.handle})](${url}) Posted on ${tweet.time}
    \n
    ${tweet.text}
    \n
  `;
    contents.push({ text: text });
    tweet.pics.forEach(pic => contents.push({ url: pic.href }));
    if (tweet.video) contents.push({ url: tweet.video.href });
    if (tweet.quote) {
        const quoteContents = quoteToText(tweet.quote);
        console.log(quoteContents, "to quote")
        console.log(contents, "mother")
        quoteContents.forEach(piece => contents.push(piece));
    }
    if (tweet.poll){
      const string = ".\nPoll:\nOption   Count\n";
      const options = pollOptions(tweet.poll);
      const poll = options.reduce((acc, opt)=> acc + `${opt.label}: ${opt.count}\n`, string);
      contents.push({text: poll});
    }
    return contents
}
function quoteToText(quote: Tweet) {
    const url = `https://twitter.com/${quote.author.handle}/statuses/${quote.index}`
    const contents = [];
    const text = ` 
      .\n
      \n
      [Quoting: ${quote.author.name} (@${quote.author.handle})](${url}) Posted on ${quote.time}
      \n
      ${quote.text}
      \n
    `;
    contents.push({ text: text });
    quote.pics.forEach(pic => contents.push({ url: pic.href }));
    if (quote.video) contents.push({ url: quote.video.href });
    return contents
}

function pollOptions(poll: Poll){
    const labels = Object.keys(poll).filter(key => key.includes("label"));
    const options = labels.map(label => {
        const count = label.split("_label")[0] + "_count"
        return { label: poll[label], count: poll[count] }
    });
    return options
}

function Preview(props: PreviewProps) {
    useEffect(() => {
        getThread(`${props.id}`).then(tweet => setTweet(tweet))
    }, []);
    const [tweet, setTweet] = useState<Tweet>(placeholder);
    console.log(tweet, "preview component")
    function setLink() {
        props.setPayload([{ url: props.url.href }]);
    }
    function setText() {
        const text = tweetToText(tweet)
        props.setPayload(text);
    }
    function quit() {
        props.setShow(false)
    }
    return (
        <div id="tweet-preview">
            <p onClick={quit} id="preview-close-button">X</p>
            <p>You want to share: {props.url.href}</p>
            <div id="author">
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
            <div id="tweet-share-buttons">
                <p>What do you want to share?</p>
                <button onClick={setLink}>Just the Link</button>
                <button onClick={setText}>Full Tweet</button>
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