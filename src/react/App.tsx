import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { useEffect, useState } from 'react';
import ShareModal from './ShareModal';
import MiniModal from './MiniModal';
import Welcome from './Welcome';
import './styles.scss';
import { urbitVisor } from '@dcspark/uv-core';

export interface TwitterProps {
  url: URL;
  id: number;
  screenshot: any;
}

export function query({ action }) {
  return new Promise((res, rej) => {
    const requestId = Math.random().toString(36).substr(2, 9);
    // first add listener for the eventual response
    window.addEventListener('message', function responseHandler(e) {
      const response = e.data;
      // ignore messages with the wrong request id
      if (response.id !== `${requestId}-res`) return;
      console.log(response, 'got response from content');
      // remove listener else they keep stacking up
      window.removeEventListener('message', responseHandler);
      // reject promise if there's an error
      if (response.error) rej(response.error);
      // resolve if fine
      else res(response);
    });
    window.postMessage({ action, id: requestId }, window.origin);
  });
}

function App(props: TwitterProps) {
  const [havePerms, setHavePerms] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bigmodal, setBigmodal] = useState(false);
  const [minimodal, setMinimodal] = useState<'success' | 'failure' | null>(null);

  useEffect(() => {
    let leakingMemory = true;
    if (leakingMemory) checkPerms();
    return () => (leakingMemory = false);
  }, [havePerms]);

  const styles = {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: minimodal ? '' : 'rgb(25, 25, 25, 0.9)',
    display: !havePerms ? 'block' : 'flex',
  };

  async function checkPerms(): Promise<void> {
    const res = await query({ action: 'check_perms' });
    setHavePerms((res as any).perms_granted);
    setBigmodal(true);
    setLoading(false);
  }

  function quit() {
    unmountComponentAtNode(document.getElementById('uv-twitter-extension-container'));
  }
  function shareTweet(data: any) {
    setBigmodal(false);
    let action = '';
    setTimeout(() => {
      if (action === 'ok') success();
      else if (action === 'ng') failure();
      else action = 'waiting';
    }, 2000);
    urbitVisor.poke(data).then(res => {
      if (res.status === 'ok') {
        if (!action) action = 'ok';
        else success();
      } else {
        if (!action) action = 'ng';
        else failure();
      }
    });
  }

  function shareAgain(data: any) {}

  function success() {
    setMinimodal('success');
    setTimeout(() => quit(), 3000);
  }
  function failure() {
    setMinimodal('failure');
    setTimeout(() => quit(), 3000);
  }

  if (loading) return <div>...</div>;
  if (!havePerms)
    return (
      <div style={styles}>
        <Welcome />
      </div>
    );
  else if (minimodal)
    return (
      <div style={styles}>
        <MiniModal type={minimodal} />
      </div>
    );
  else if (bigmodal)
    return (
      <div style={styles}>
        <ShareModal sendPoke={shareTweet} {...props} />
      </div>
    );
  else return <div />;
}

export default App;
