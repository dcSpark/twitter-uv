import React from 'react';
import { urbitVisor } from '@dcspark/uv-core';
import mainLogo from './icon128.png';

function Welcome() {
  async function requestPerms(): Promise<void> {
    await urbitVisor.requestPermissions(['shipName', 'scry', 'subscribe', 'poke']);
  }
  return (
    <div id="uv-twitter-extension-welcome">
      <div id="uv-twitter-extension-welcome-icon">
        <img src={mainLogo} alt="" />
      </div>
      <h4>Welcome to the Twitter UV Extension</h4>
      <p>
        In order to use the extension you must first grant it permissions to scry, subscribe, and
        read your Urbit ship's name.
      </p>
      <p>
        Click on the button below to request permissions, then click on your Urbit Visor extension
        icon to grant them.
      </p>

      <div className="permission-button-container">
        <button id="uv-twitter-extension-welcome-button" onClick={requestPerms}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="urbit-icon"
          >
            <circle cx="16" cy="16" r="13" fill="white" stroke="currentcolor" strokeWidth="2" />
            <path
              d="M22 14.0488H19.6306C19.4522 15.0976 18.9936 15.7317 18.1783 15.7317C16.7006 15.7317 15.8599 14 13.5669 14C11.3503 14 10.1783 15.3659 10 17.9756H12.3694C12.5478 16.9024 13.0064 16.2683 13.8471 16.2683C15.3248 16.2683 16.1146 18 18.4586 18C20.6242 18 21.8217 16.6341 22 14.0488Z"
              fill="black"
            />
          </svg>
          <p>Request Permissions</p>
        </button>
      </div>
    </div>
  );
}

export default Welcome;
