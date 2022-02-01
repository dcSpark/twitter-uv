import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import Welcome from './Welcome';
import './styles.scss';

function App2() {
  const styles = {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgb(25, 25, 25, 0.9)',
    display: 'block',
  };
  const wrapperStyles = {
    position: 'relative',
  };

  return (
    <div style={styles}>
      <div className="welcome-wrapper" style={wrapperStyles}></div>
      <Welcome />
    </div>
  );
}

export default App2;
