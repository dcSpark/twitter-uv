# Urbit Visor Twitter Extension

This extension adds Urbit functionality to Twitter.com through inter-operation with Urbit Visor.
You need to have Urbit Visor installed to use this extension.

## Get started
1. Clone this repo
2. Go to `chrome://extensions` on your browser (or `brave://extensions` if using Brave)
3. Enable "developer mode", click on "load unpacked".
4. Run `npm run start` on the terminal.
5. Add the ./dist folder.

## Test functionality
The extension should inject an Urbit icon in the button row under any tweet read at twitter.com.
Click the button and it will (assuming Visor permissions exist, if not it'll ask for them) show up a floating window at the top of the page with a list of channels your ship is subscribed to.
Click on a channel and it will post the tweet URL to the channel.

## Develop
This is a very bare-bones setup, no background script, no popup page, just a content script injecting code to twitter.com
At present we're using esbuild to build the extension.
Run `npm start` to start a dev server and build the extension, add the root folder to your chrome extensions.
Remember to reload the extension at your extensions page, then reload the Twitter.com after any update.
esbuild doesn't check types, run `tsc --noemit` for that.
