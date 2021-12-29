import React, { useMemo, useRef, useEffect, useState } from "react";
import { Tweet, Poll } from "../api/client";
import { pollOptions } from "../utils/parsing";

const placeholder = {
  author: {
    name: "",
    handle: "",
    avatar: "",
  },
  pics: [],
  time: "1d",
  video: null,
  text: "",
  quote: null,
  poll: null,
};

interface PreviewProps {
  tweet: Tweet;
}

const parseText = (text: String) => {
  let textArr = text.split(/\r?\n/);
  console.log("before parse:", textArr);
  textArr = textArr.slice(0, textArr.length - 2);
  console.log("after parse:", textArr);
  return textArr;
};

const imageOrientation = (pics) => {
  const currentImage = new Image();
  currentImage.src = pics[0].href;

  if (currentImage.width === currentImage.height) return "";

  return currentImage.width > currentImage.height ? "landscape" : "portrait";
};

function Preview({ tweet }: PreviewProps) {
  const parsedText = parseText(tweet.text);

  return (
    <div
      id="tweet-preview"
      className={
        tweet.pics.length > 0 && !tweet.quote && !tweet.poll
          ? "tweet-contains-pics"
          : ""
      }
    >
      <div className="left-column">
        <div className="tweet-author-wrapper">
          <img className="avatar" src={tweet.author.avatar} alt="" />
          <div className="tweet-author-date-wrapper">
            <div className="tweet-author-name-wrapper">
              <span className="tweet-author-name">{tweet.author.name}</span>
              <span className="tweet-author-handle">
                @{tweet.author.handle}
              </span>
            </div>
            <p className="tweet-date">posted: {tweet.time}</p>
          </div>
        </div>
        <div id="tweet-body">
          <div className="tweet-text">
            {parsedText.map((sentence) => (
              <p
                key={parsedText.indexOf(sentence)}
                className={sentence.length < 1 ? "line-break" : ""}
              >
                {sentence}
              </p>
            ))}
          </div>
          {tweet.poll && <Poll poll={tweet.poll} />}
          {tweet.quote && <Quote quote={tweet.quote} />}
        </div>
      </div>
      <div className="right-column">
        <div id={tweet.video ? "video-tweet" : ""} className="cropped">
          {tweet.pics.length > 0 && !tweet.video && (
            <Pics pics={tweet.pics} isVideo={false} />
          )}
          {tweet.video && <Pics pics={tweet.pics} isVideo={true} />}
        </div>
      </div>
    </div>
  );
}

function Quote({ quote }) {
  const parsedText = parseText(quote.text);

  return (
    <div
      id="tweet-quote"
      className={quote.pics.length > 0 ? "tweet-contains-pics" : ""}
    >
      <div className="left-column">
        <div className="tweet-author-wrapper">
          <img className="avatar" src={quote.author.avatar} alt="" />
          <div className="tweet-author-date-wrapper">
            <div className="tweet-author-name-wrapper">
              <span className="tweet-author-name">{quote.author.name}</span>
              <span className="tweet-author-handle">
                @{quote.author.handle}
              </span>
            </div>
            <p className="tweet-date">posted: {quote.time}</p>
          </div>
        </div>
        <div id="tweet-body">
          <div className="tweet-text">
            {parsedText.map((sentence) => (
              <p
                key={parsedText.indexOf(sentence)}
                className={sentence.length < 1 ? "line-break" : ""}
              >
                {sentence}
              </p>
            ))}
          </div>
          {quote.video && <Video pic={quote.video} />}
          {quote.poll && <Poll poll={quote.poll} />}
        </div>
      </div>
      <div className="right-column">
        <div id={quote.video ? "video-tweet" : ""} className="cropped">
          {quote.pics.length > 0 && (
            <Pics pics={quote.pics} isVideo={quote.video ? true : false} />
          )}
        </div>
      </div>
    </div>
  );
}

function Pics({ pics, isVideo }) {
  const [loaded, setLoaded] = useState(false);

  const imageClass = useMemo(() => {
    return loaded ? `img-${pics.length} ${imageOrientation(pics)}` : "";
  }, [loaded]);

  return (
    <div id="tweet-pictures" className={pics.length > 1 ? "multi-pics" : ""}>
      {pics && (
        <>
          <img
            className={imageClass}
            src={pics[0]}
            alt=""
            onLoad={() => setLoaded(true)}
          />
          {pics.length > 1 && (
            <>
              <div className="plus-sign">+</div>
              <div className="pics-count">{pics.length - 1}</div>
            </>
          )}
          {isVideo && (
            <div className="play-button">
              <svg
                width="32"
                height="40"
                viewBox="0 0 32 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M30.896 17.9439L3.78414 0.471124C2.17573 -0.395167 0.333252 -0.305255 0.333252 2.80454V37.2107C0.333252 40.0536 2.30988 40.5017 3.78414 39.5441L30.896 22.0713C32.0121 20.931 32.0121 19.0842 30.896 17.9439Z"
                  fill="white"
                />
              </svg>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Video({ pic }) {
  return (
    <div id="tweet-video">
      <img src={pic[0]} alt="" />
    </div>
  );
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
        );
      })}
    </div>
  );
}

export default Preview;
