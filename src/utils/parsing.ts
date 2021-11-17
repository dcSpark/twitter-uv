import { getTweet, getThread, Tweet, Poll } from "../api/client";

export function tweetToText(tweet: Tweet) {
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

export function pollOptions(poll: Poll){
    const labels = Object.keys(poll).filter(key => key.includes("label"));
    const options = labels.map(label => {
        const count = label.split("_label")[0] + "_count"
        return { label: poll[label], count: poll[count] }
    });
    return options
}