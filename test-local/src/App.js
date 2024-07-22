/**
 * Main entry point for the Sundai Club game application. It sets up and initiates the Phaser game engine.
 * This file initializes the game with configurations and handles the lifecycle of the game instance.
 */
import React, { useEffect } from 'react';
import Phaser from 'phaser';
import ChatScene from './components/ChatScene.js';
import ComputerLabScene from './components/ComputerLabScene.js';
import './App.css';

const Groq = require('groq-sdk');

// API key handling (please replace with secure environment variables in production)
var GROQ_API_KEY = 'g'
GROQ_API_KEY = GROQ_API_KEY || 's';
GROQ_API_KEY = GROQ_API_KEY || 'k_T27oIhdr';
GROQ_API_KEY = GROQ_API_KEY || 'lfQmdiDspqYMWGdyb3FYvD0GVkMxhmalMN7TWTteMurD';

// Initialize the Groq API with the provided API key
const groq = new Groq({ apiKey:  GROQ_API_KEY , dangerouslyAllowBrowser: true});

/**
 * Represents the primary chat functionality in the game, allowing interactions between characters.
 * Manages messages and responds using the Groq SDK.
 */
class ChatManager {
  /**
   * Creates an instance of ChatManager.
   * @param {string} characterDescription - Description of the character for which the manager is instantiated.
   */
  constructor(characterDescription) {
      this.characterDescription = characterDescription;
      this.messages = [{
          "role": "system",
          "content": "You are a strange old man that speaks in riddles about programming and wizardry. You are concise and bizarre."
      }];
  }

  /**
   * Adds a message to the chat.
   * @param {string} role - The role of the sender (e.g., 'system', 'user', 'character').
   * @param {string} content - The content of the message to be added.
   */
  addMessage(role, content) {
      this.messages.push({ role, content });
  }

  /**
   * Fetches a character response from the Groq API based on the current chat history.
   * @returns {Promise<string>} The character's response as a string.
   */
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

/**
 * NPC class extends Phaser's Sprite class, representing non-player characters in the game.
 * It manages the character's animations, interactions, and chat functionalities.
 */
class NPC extends Phaser.Physics.Arcade.Sprite {
    /**
     * Creates an instance of an NPC.
     * @param {Phaser.Scene} scene - The scene this NPC belongs to.
     * @param {number} x - The x position of the NPC in the scene.
     * @param {number} y - The y position of the NPC in the scene.
     * @param {string} key - The texture key to use for this NPC.
     * @param {string} characterDescription - A description of the NPC's character.
     * @param {string} animKey - The key for the animation this NPC will use.
     * @param {number} startFrame - The starting frame number for the animation.
     * @param {number} endFrame - The ending frame number for the animation.
     */
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

    /**
     * Sets the cursor style when hovering over the NPC based on the proximity of the player.
     */
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

    /**
     * Updates the NPC's movement and behavior each frame, considering the direction and chatting status.
     */
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

    /**
     * Creates and initializes an animation for this NPC.
     * @param {string} animKey - The key for the animation.
     * @param {number} startFrame - The starting frame number for the animation.
     * @param {number} endFrame - The ending frame number for the animation.
     */
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

    /**
     * Opens the chat interface for this NPC, making it the active chat participant.
     */
    openChat() {
        this.isChatting = true;
        this.scene.openChat(this);
    }

    /**
     * Closes the chat interface, allowing the NPC to resume other behaviors.
     */
    closeChat() {
        this.isChatting = false;
    }

    /**
     * Checks if the player is within a certain range of this NPC.
     * @param {Phaser.GameObjects.GameObject} player - The player's game object.
     * @returns {boolean} True if the player is within interaction range, false otherwise.
     */
    playerInRange(player) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        return distance < 230;
    }
}

/**
 * Game configuration object for Phaser. Specifies the type of renderer, game dimensions, physics settings, and more.
 */
const config = {
  type: Phaser.AUTO,
  parent: 'phaser-container',
  width: 1400,
  height: 890,
  scene: [ChatScene, ComputerLabScene],
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

/**
 * The main React component for the application. It initializes the Phaser game and handles its lifecycle.
 * @returns {JSX.Element} The rendered component.
 */
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
