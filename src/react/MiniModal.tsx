import React from 'react';

interface UrbitChannel {
  title: string;
  type: 'post' | 'chat' | 'link' | 'publish' | null;
  group: string;
  ship: string;
  name: string;
}
interface MiniModalProps {
  type: 'success' | 'failure';
  channel?: UrbitChannel;
}

export default function MiniModal(props: MiniModalProps) {
  //   const successMessage = `Tweet successfully shared on ${props.channel.ship}/${props.channel.group}/${props.channel.name}`
  const successMessage = `Tweet shared succesfully`;
  const failureMessage = 'Error sharing the Tweet, please try again later';
  const icon = props.type === 'success' ? 'success' : 'failure';
  const message = props.type === 'success' ? successMessage : failureMessage;

  return (
    <div id="uv-twitter-mini-modal" className={`${props.type}-modal`}>
      <div id="uv-twitter-mini-modal-icon">
        <div className={icon + '-mark'}></div>
        <div className={icon + '-circle'}></div>
      </div>
      <div id="uv-twitter-mini-modal-message">{message}</div>
    </div>
  );
}
