import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import Welcome from './Welcome';
import './styles.css';

function App2() {

  const styles = {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgb(25, 25, 25, 0.9)',
    display:'block'
  };

    return (
      <div style={styles}>
        <Welcome />
      </div>
    );

}

export default App2;
