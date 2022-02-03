import React, { useMemo, useState } from 'react';
import { Tweet, Poll, TweetEntity } from '../api/client';
import { pollOptions } from '../utils/parsing';

const placeholder = {
  author: {
    name: '',
    handle: '',
    avatar: '',
  },
  pics: [],
  time: '1d',
  video: null,
  text: '',
  quote: null,
  poll: null,
};

let mapKeyCounter = 0;

const generateMapKey = () => {
  mapKeyCounter++;
  return mapKeyCounter;
};

interface PreviewProps {
  tweet: Tweet;
  threadCount: number;
}

const parseText = (text: String, entities?: TweetEntity[]) => {
  let output = text;

  if (!entities) {
    return [...text].join('').split(/\r?\n/);
  }

  for (let i = 0; i < entities.length; i++) {
    const current = entities[i];

    if ('url' in current) {
      output = output.replace(
        current.url,
        `<a href="${current.expanded_url}" target="_blank" rel="noopener noreferrer"<span>${current.display_url}</span></a>`
      );
      continue;
    }
    if (`screen_name` in current) {
      output = output.replace(`@${current.screen_name}`, `<span>@${current.screen_name}</span>`);
      continue;
    }
    if (current.entity_type === 'hashtag') {
      output = output.replace(`#${current.text}`, `<span>#${current.text}</span>`);
      continue;
    }
    if (current.entity_type === 'symbol') {
      output = output.replace(`$${current.text}`, `<span>$${current.text}</span>`);
    }
  }

  return [...output].join('').split(/\r?\n/);
};

const imageOrientation = pics => {
  const currentImage = new Image();
  currentImage.src = pics[0].href;

  if (currentImage.width === currentImage.height) return '';

  return currentImage.width > currentImage.height ? 'landscape' : 'portrait';
};

function Preview({ tweet, threadCount }: PreviewProps) {
  const parsedText = parseText(tweet.text, tweet.entities);

  return (
    <div
      id="tweet-preview"
      className={tweet.pics.length > 0 && !tweet.quote && !tweet.poll ? 'tweet-contains-pics' : ''}
    >
      <div className="preview-container">
        <div className="left-column">
          <div className="tweet-author-wrapper">
            <img className="avatar" src={tweet.author.avatar} alt="" />
            <div className="tweet-author-date-wrapper">
              <div className="tweet-author-name-wrapper">
                <span className="tweet-author-name">{tweet.author.name}</span>
                <span className="tweet-author-handle">@{tweet.author.handle}</span>
              </div>
              <p className="tweet-date">posted: {tweet.time}</p>
            </div>
          </div>
          <div id="tweet-body">
            <div className="tweet-text">
              {parsedText.map(sentence => (
                <p
                  key={generateMapKey()}
                  className={sentence.length < 1 ? 'line-break' : null}
                  dangerouslySetInnerHTML={{ __html: sentence }}
                ></p>
              ))}
            </div>
            {tweet.poll && <Poll poll={tweet.poll} />}
            {tweet.quote && <Quote quote={tweet.quote} />}
          </div>
        </div>
        <div className="right-column">
          <div id={tweet.video ? 'video-tweet' : ''} className="cropped">
            {tweet.pics.length > 0 && !tweet.video && <Pics pics={tweet.pics} isVideo={false} />}
            {tweet.video && <Pics pics={tweet.pics} isVideo={true} />}
          </div>
        </div>
      </div>
      {/* Logic for only showing on Unroll Thread that contains tweets */}
      {threadCount && <div className="unroll-thread-count">And {threadCount} more tweets</div>}
    </div>
  );
}

function Quote({ quote }) {
  const parsedText = parseText(quote.text);

  return (
    <div id="tweet-quote" className={quote.pics.length > 0 ? 'tweet-contains-pics' : ''}>
      <div className="left-column">
        <div className="tweet-author-wrapper">
          <img className="avatar" src={quote.author.avatar} alt="" />
          <div className="tweet-author-date-wrapper">
            <div className="tweet-author-name-wrapper">
              <span className="tweet-author-name">{quote.author.name}</span>
              <span className="tweet-author-handle">@{quote.author.handle}</span>
            </div>
            <p className="tweet-date">posted: {quote.time}</p>
          </div>
        </div>
        <div id="tweet-body">
          <div className="tweet-text">
            {parsedText.map(sentence => (
              <p
                key={parsedText.indexOf(sentence)}
                className={sentence.length < 1 ? 'line-break' : ''}
              >
                {sentence}
              </p>
            ))}
          </div>
          {quote.poll && <Poll poll={quote.poll} />}
        </div>
      </div>
      <div className="right-column">
        <div id={quote.video ? 'video-tweet' : ''} className="cropped">
          {quote.pics.length > 0 && <Pics pics={quote.pics} isVideo={quote.video ? true : false} />}
        </div>
      </div>
    </div>
  );
}

function Pics({ pics, isVideo }) {
  const [loaded, setLoaded] = useState(false);

  const imageClass = useMemo(() => {
    return loaded ? `img-${pics.length} ${imageOrientation(pics)}` : '';
  }, [loaded]);

  return (
    <div id="tweet-pictures" className={pics.length > 1 ? 'multi-pics' : ''}>
      {pics && (
        <>
          <img className={imageClass} src={pics[0]} alt="" onLoad={() => setLoaded(true)} />
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

function numberWithCommas(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function calculateVotePercent(choiceVotes, totalVotes): string {
  return ((choiceVotes / totalVotes) * 100).toFixed(1);
}

function Poll({ poll }) {
  const options = pollOptions(poll);
  const totalVotes = options
    .map(item => parseInt(item.count, 10))
    .reduce((prev, next) => prev + next);
  const majorityVote = options.reduce((prev, current) =>
    parseInt(prev.count) > parseInt(current.count) ? prev.count : current.count
  );

  return (
    <div id="twitter-poll">
      {options.map((opt, i) => {
        const barPercentage = {
          width: calculateVotePercent(opt.count, totalVotes) + '%',
        };

        return (
          <div
            key={i}
            className={
              opt.count === majorityVote ? 'twitter-poll-option majority' : 'twitter-poll-option'
            }
          >
            <div style={barPercentage} className="vote-percentage-bar"></div>
            <p className="vote-label">{opt.label}</p>
            <p className="vote-count">{calculateVotePercent(opt.count, totalVotes)}%</p>
          </div>
        );
      })}
      <div id="total-votes">{numberWithCommas(totalVotes)} votes</div>
    </div>
  );
}

export default Preview;
