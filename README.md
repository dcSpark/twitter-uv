<h1 align="center">
  <img src="assets/twitter-uv-logo.png" width="224px"/><br/>
  Twitter UV
</h1>
<p align="center">Twitter UV is a web extension which bridges Twitter and Urbit. It allows users to easily share tweets and unroll whole threads at the click of a button directly onto their ships for sharing with others or archival purposes.

<p align="center"><img src="https://img.shields.io/badge/version-v0.2.2-blue?style=for-the-badge&logo=none" />&nbsp;&nbsp;<img src="https://img.shields.io/badge/license-mit-blue?style=for-the-badge&logo=none" alt="license" /></p>

## Getting Started

The fastest way to get started using Twitter UV is via [the Chrome Web Store](https://chrome.google.com/webstore/detail/twitter-uv/dfidmeghmgfhhflhfopoeinniomenjlf?hl=en&authuser=0).

This will provide you with a seamless install process and allow you to get up and running instantly. Once you have installed the extension simply open Twitter on a new tab to be introduced to the welcome screen.

## FAQ

#### Why do I not see the welcome screen after installing Twitter UV?

The Twitter UV welcome screen is shown on the first new page load of Twitter have the extension has been installed. Simply do a hard refresh of your currently open Twitter page, or open a new tab and visit Twitter.

#### Why can I can only select three channels to share in?

This was purposefully implemented inside of the extension to prevent users from spamming every group at the exact same time. This doesn't prevent them from doing so completely, but makes it less friendly from a UX perspective while not impeding on normal users at all.

## Building Locally

1. Clone this repo
2. Go to `chrome://extensions` on your browser (or `brave://extensions` if using Brave)
3. Enable "developer mode", click on "load unpacked".
4. Run `npm run start` on the terminal.
5. Add the ./dist folder.

## Development

Run `npm start` to start a dev server and build the extension, add the dist folder to your chrome extensions.
Remember to reload the extension at your extensions page, then reload the Twitter.com after any update.
