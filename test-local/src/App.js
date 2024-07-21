import React, { useEffect } from 'react';
import Phaser from 'phaser';
import ChatScene from './components/ChatScene.js';

import './App.css';

const Groq = require('groq-sdk');

const groq = new Groq();
groq.apiKey = process.env.GROQ_API_KEY;

// The game code here
class ChatManager {
  constructor(characterDescription) {
      this.characterDescription = characterDescription;
      this.messages = [
        {
          "role": "system",
          "content": "You are a strange old man that speaks in riddles about programming and wizardry. You are concise and bizarre."
        }
      ];
  }

  addMessage(role, content) {
      this.messages.push({ role, content });
  }

  async getCharacterResponse() {
      try {
          const chatCompletion = await groq.chat.completions.create({
              "messages": this.messages,
              "model": "llama3-8b-8192",
              "temperature": 1,
              "max_tokens": 1024,
              "top_p": 1,
              "stream": false,
              "stop": null
          });

          // Log the chatCompletion object to inspect its structure
        console.log('chatCompletion:', chatCompletion);

          // Initialize response variable
          const response = chatCompletion.choices.map(choice => choice.message?.content || '').join('');
          return response;

      } catch (error) {
          console.error('Error fetching character response:', error);
          // Provide a fallback response for testing
          return "I'm sorry, I couldn't fetch a response at this moment.";
      }
  }
}

class NPC extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, characterDescription, animKey, startFrame, endFrame) {
        super(scene, x, y, key);

        this.scene = scene;
        this.characterDescription = characterDescription;
        this.isChatting = false;
        this.chatLogId = 'chatLogContent-' + characterDescription.replace(/\s+/g, '-').toLowerCase(); // Unique ID for each chat log

        scene.physics.world.enable(this);
        this.setCollideWorldBounds(true);
        this.setInteractive();

        scene.add.existing(this);

        this.directionChangeTimer = 0;
        this.direction = 'down';

        this.isChatOpen = false;
        this.chatManager = new ChatManager(characterDescription);

        this.createAnimation(animKey, startFrame, endFrame);
    }

    setCursorStyle() {
        this.on('pointerover', () => {
            if (this.playerInRange(this.scene.player)) {
                this.scene.input.setDefaultCursor('pointer');
            }
        });

        this.on('pointerout', () => {
            this.scene.input.setDefaultCursor('default');
        });
    }

    update() {
        if (this.isChatting) return;

        if (this.directionChangeTimer <= 0) {
            const directions = ["up", "down", "left", "right"];
            this.direction = directions[Math.floor(Math.random() * directions.length)];
            this.directionChangeTimer = 50;
        }

        if (this.direction === "up") this.y -= 1;
        if (this.direction === "down") this.y += 1;
        if (this.direction === "left") this.x -= 1;
        if (this.direction === "right") this.x += 1;

        this.directionChangeTimer -= 1;
    }

    createAnimation(animKey, startFrame, endFrame) {
        this.scene.anims.create({
            key: animKey,
            frames: this.scene.anims.generateFrameNumbers(this.texture.key, {
                start: startFrame,
                end: endFrame
            }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.play(animKey, true);
    }

    openChat() {
        this.isChatting = true;
        this.scene.openChat(this);
    }

    closeChat() {
        this.isChatting = false;
    }

    playerInRange(player) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        return distance < 230;
    }
}

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

export default App;
