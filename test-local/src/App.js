import React, { useEffect } from 'react';
import Phaser from 'phaser';
import ChatScene from './components/ChatScene.js';
import './App.css';

const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: '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', dangerouslyAllowBrowser: true });

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-container',
  width: 1400,
  height: 890,
  scene: ChatScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  dom: {
    createContainer: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  input: {
    keyboard: {
      capture: [37, 38, 39, 40]
    }
  }
};

function App() {
  useEffect(() => {
    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div id="phaser-container" style={{ width: '100%', height: '100%' }}></div>
      </header>
    </div>
  );
}

export { App as default, groq };
