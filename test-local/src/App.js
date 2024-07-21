import React, { useEffect } from 'react';
import Phaser from 'phaser';
import './App.css';

const baseStyle = `
    font-family: 'Trebuchet MS', serif;
    font-size: 20px;
    border: 2px solid #4e342e;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.9);
`;

const chatLogStyle = `
    ${baseStyle}
    width: 240px;
    height: 570px;
    background-color: rgba(0, 0, 0, 0.0);
    padding: 10px;
    direction: ltr;
    box-shadow: none;
    border: none;
    overflow-y: auto;
`;

const inputStyle = `
    ${baseStyle}
    width: 270px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.4);
    box-shadow: none;
`;

const sendButtonStyle = `
    ${baseStyle}
    width: 270px;
    height: 44px;
    color: #e0d7c5;
    background: linear-gradient(to bottom, #957d5f, #6c543e);
    box-shadow: none;
`;

const closeButtonStyle = `
    ${baseStyle}
    width: 30px;
    height: 30px;
    border-radius: 30px; // makes the button circular
    color: #fff; // white text color
    background-color: #ff6347; // tomato red background
    font-size: 30px; // larger font size for the 'X'
    text-align: center; // centers the 'X' in the button
    line-height: 30px; // vertically centers the 'X' in the button
    cursor: pointer; // changes cursor to pointer on hover
`;

// const Groq = require('groq-sdk');

// const groq = new Groq();
// groq.apiKey = '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';

// The game code here
class ChatManager {
  constructor(characterDescription) {
      this.characterDescription = characterDescription;
      this.messages = [];
  }

  addMessage(role, message) {
      this.messages.push({ role, message });
  }

  async getCharacterResponse() {
      try {
          // const chatCompletion = await groq.chat.completions.create({
          //     "messages": this.messages,
          //     "model": "llama3-8b-8192",
          //     "temperature": 1,
          //     "max_tokens": 1024,
          //     "top_p": 1,
          //     "stream": false,
          //     "stop": null
          // });

          const chatCompletion = null;

          let response = '';
          for await (const chunk of chatCompletion) {
              response += chunk.choices[0]?.delta?.content || '';
          }
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

class ChatScene extends Phaser.Scene {
    preload() {
        this.load.image('background', 'https://storage.googleapis.com/rosebud_assets_storage/6cdbb197-849e-4ea9-96ed-459b077d65d6.png');
        this.load.image('foreground', `https://play.rosebud.ai/assets/ai-town-foreground.png.png?R413`)
        this.load.spritesheet('player', `https://play.rosebud.ai/assets/cat_Walk.png.png?Yuts`, {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.spritesheet('playerIdle', `https://play.rosebud.ai/assets/cat_Idle.png.png?FCX2`, {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.spritesheet('girl', 'https://storage.googleapis.com/rosebud_assets_storage/de59b859-e0dc-490e-953a-d95a0bbf0b7f.png', {
            frameWidth: 96,
            frameHeight: 64
        });
        this.load.spritesheet('boy', 'https://storage.googleapis.com/rosebud_assets_storage/3115e7db-2ed2-4d06-a10a-843ac410e1ac.png', {
            frameWidth: 96,
            frameHeight: 64
        });
        this.load.spritesheet('fishingguy', `https://play.rosebud.ai/assets/waiting01.png?stn8`, {
            frameWidth: 96,
            frameHeight: 64
        });
        this.load.image('scroll', `https://play.rosebud.ai/assets/scrollpage03.png.png?g4DO`);
        this.load.audio('music', `https://play.rosebud.ai/assets/Game Village Shop RPG Theme (Endless Loop Version) - Elevate Audio.mp3.mp3?EUXn`);

    }

    create() {
        this.physics.world.setBounds(0, 0, 1080, 890);

        this.add.image(550, 445, 'background').setScale(1.25);

        this.add.image(1225, 445, 'scroll');

        this.anims.create({
            key: 'playerWalking', // Use a descriptive key for the animation
            frames: this.anims.generateFrameNumbers('player', {
                start: 0,
                end: 3 // Adjust according to your sprite frames
            }),
            frameRate: 10,
            repeat: -1
        });

        // Player idle animation
        this.anims.create({
            key: 'playerIdle',
            frames: this.anims.generateFrameNumbers('playerIdle', {
                start: 0,
                end: 3
            }),
            frameRate: 5,
            repeat: -1
        });

        this.player = this.physics.add.sprite(360, 300, 'player').setScale(2);
        this.player.body.setSize(25, 22);
        this.player.body.setOffset(8, 25);
        this.player.setCollideWorldBounds(true);
        // Start with the player in idle animation
        this.player.anims.play('playerIdle', true);

        this.input.on('gameobjectdown', (pointer, gameObject) => {
            if (gameObject instanceof NPC && gameObject.playerInRange(this.player)) {
                gameObject.openChat();
            }
        });

        this.colliders = this.physics.add.staticGroup();

        this.addCollider(390, 105, 180, 130);
        this.addCollider(670, 105, 120, 140);
        this.addCollider(885, 105, 110, 125);
        this.addCollider(120, 270, 110, 175);
        this.addCollider(650, 310, 90, 125);
        this.addCollider(795, 310, 80, 105);
        this.addCollider(85, 550, 80, 105);
        this.addCollider(330, 570, 80, 125);
        this.addCollider(550, 570, 160, 140);
        this.addCollider(770, 580, 120, 80);
        this.addCollider(970, 510, 110, 160);
        this.addCollider(710, 750, 90, 100);
        this.addCollider(545, 750, 80, 90);
        this.physics.add.collider(this.player, this.colliders);

        this.chatDialogs = new Map();
        // Play the audio
        const music = this.sound.add('music', {
            volume: 0.05,
            loop: true
        });

        music.play();

        this.add.image(550, 445, 'foreground').setScale(1.25);

        this.cursors = this.input.keyboard.createCursorKeys();

        // Create NPCs and set cursor style for hover
        this.fishingguy = new NPC(this, 656, 500, 'fishingguy', 'Kev is a huge fishing lover. His dream is to become a captain just like your uncle who left for his dream to travel the world..', 'fishingguy', 0, 3).setScale(-2.5, 2.5);
        this.fishingguy.setInteractive();
        this.fishingguy.setCursorStyle();

        this.girl = new NPC(this, 1000, 300, 'girl', 'Ellie left home dreaming...', 'girl', 0, 4).setScale(3);
        this.girl.setInteractive();
        this.girl.setCursorStyle();

        this.boy = new NPC(this, 200, 170, 'boy', 'Kenji is a cheerful guy...', 'boy', 0, 7).setScale(3);
        this.boy.setInteractive();
        this.boy.setCursorStyle();
    }

    update() {
        if (this.isChatOpen) {
            if (this.cursors.up.isDown || this.cursors.down.isDown || this.cursors.left.isDown || this.cursors.right.isDown) {
                this.closeChat();
            }
            return;
        }

        const cursors = this.input.keyboard.createCursorKeys();
        const speed = 160;
        let isMoving = false;

        if (cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
            isMoving = true;
        } else if (cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
            isMoving = true;
        } else {
            this.player.setVelocityX(0);
        }

        if (cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            isMoving = true;
        } else if (cursors.down.isDown) {
            this.player.setVelocityY(speed);
            isMoving = true;
        } else {
            this.player.setVelocityY(0);
        }

        // Play the appropriate animation based on movement
        if (isMoving) {
            this.player.anims.play('playerWalking', true);
        } else {
            this.player.anims.play('playerIdle', true);
        }
    }

    addCollider(x, y, width, height) {
        const collider = this.colliders.create(x, y, null).setOrigin(0, 0).refreshBody().setVisible(false);
        collider.body.setSize(width, height);
    }

    openChat(npc) {
        console.log("LET'S OPEN CHAT");
        if (this.isChatOpen) return;
        this.isChatOpen = true;

        console.log("NPC", npc);

        const uniqueIdSuffix = npc.characterDescription.replace(/\s+/g, '-').toLowerCase();

        if (this.chatDialogs.has(npc)) {
            console.log("HAS NPC");
            const dialog = this.chatDialogs.get(npc);
            dialog.chatLog.setVisible(true);
            dialog.chatInput.setVisible(true);
            dialog.sendButton.setVisible(true);
            dialog.closeButton.setVisible(true);
            dialog.chatInput.node.focus();
        } else {
            const chatLog = this.add.dom(1260, 400).createFromHTML(`
                <div id="${npc.chatLogId}" style="${chatLogStyle}"></div>`);

            const chatInputId = `chatInput-${uniqueIdSuffix}`;
            const chatInput = this.add.dom(1240, 720).createFromHTML(`
                <input type="text" id="${chatInputId}" style="${inputStyle}" />`);

            const sendButtonId = `sendButton-${uniqueIdSuffix}`;
            const sendButton = this.add.dom(1240, 770).createFromHTML(`
                <button id="${sendButtonId}" style="${sendButtonStyle}">Send</button>`);

            const closeButtonId = `closeButton-${uniqueIdSuffix}`;
            const closeButton = this.add.dom(1380, 115).createFromHTML(`
                <button id="${closeButtonId}" style="${closeButtonStyle}">X</button>`);

            chatInput.node.addEventListener('keydown', (event) => {
                event.stopPropagation();
                if (event.key === "Enter" || event.keyCode === 13) {
                    this.sendChatMessage(npc, npc.chatManager, chatInputId, npc.chatLogId);
                }
            });

            sendButton.addListener('click').on('click', () => {
                this.sendChatMessage(npc, npc.chatManager, chatInputId, npc.chatLogId);
            });

            closeButton.addListener('click').on('click', () => {
                this.closeChat();
            });

            chatInput.node.focus();

            this.chatDialogs.set(npc, {
                chatLog,
                chatInput,
                sendButton,
                closeButton
            });

            console.log(chatLog);
        }
    }

    closeChat() {
        if (!this.isChatOpen) return;
        this.isChatOpen = false;
        //this.girl.closeChat();

        for (let dialog of this.chatDialogs.values()) {
            dialog.chatLog.setVisible(false);
            dialog.chatInput.setVisible(false);
            dialog.sendButton.setVisible(false);
            dialog.closeButton.setVisible(false);
        }
    }

    updateChatLog(chatLogNode, role, message) {
        const color = role === 'Player' ? '#3d1e01' : '#8a0094';
        chatLogNode.innerHTML += `<p style="color: ${color};">${role}: ${message}</p>`;
        chatLogNode.scrollTop = chatLogNode.scrollHeight;
    }

    async sendChatMessage(npc, chatManager, chatInputId, chatLogId) {
        const chatInputNode = document.getElementById(chatInputId);
        const chatLogNode = document.getElementById(chatLogId);

        if (chatInputNode && chatLogNode) {
            const inputValue = chatInputNode.value;
            if (inputValue) {
                chatManager.addMessage('user', inputValue);
                this.updateChatLog(document.getElementById(npc.chatLogId), 'Player', inputValue);

                const response = await chatManager.getCharacterResponse();
                chatManager.addMessage('assistant', response);
                this.updateChatLog(document.getElementById(npc.chatLogId), 'Character', response);

                document.getElementById('chatInput').value = '';
            }
        }
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
            capture: [37, 38, 39, 40] // Capture only arrow keys
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
