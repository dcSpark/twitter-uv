import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { useEffect, useState } from 'react';
import ShareModal from './ShareModal';
import MiniModal from './MiniModal';
import Welcome from './Welcome';
import './styles.css';
import { urbitVisor } from '@dcspark/uv-core';

export interface TwitterProps {
  url: URL;
  id: number;
  screenshot: any;
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
    urbitVisor.on('permissions_granted', [], perms => {
      console.log(perms, 'perms read');
      setHavePerms(true);
    });
    const res = await urbitVisor.authorizedPermissions();
    if (res.status === 'locked')
      unmountComponentAtNode(document.getElementById('uv-twitter-extension-container'));
    else {
      const ok = ['shipName', 'scry', 'subscribe', 'poke'].every(perm =>
        res.response.includes(perm)
      );
      setHavePerms(ok);
      setBigmodal(true);
      setLoading(false);
    }
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
