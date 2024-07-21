import Phaser from 'phaser';
import NPC from './NPC';
import Player from './Player';
import { createAnimations } from './animations';
import { addColliders } from './colliders';

class ChatScene extends Phaser.Scene {
    preload() {
        this.load.image('background', '/assets/hoenn_remake__rustboro_city_by_yuysusl_d4y385y-fullview.jpg');
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
            <div id="${npc.chatLogId}" class="chat-log"></div>`);
      
            const chatInputId = `chatInput-${uniqueIdSuffix}`;
            const chatInput = this.add.dom(1240, 720).createFromHTML(`
                <input type="text" id="${chatInputId}" class="input-style" />`);            

            const sendButtonId = `sendButton-${uniqueIdSuffix}`;
            const sendButton = this.add.dom(1240, 770).createFromHTML(`
                <button id="${sendButtonId}" class="send-button">Send</button>`);
            
            const closeButtonId = `closeButton-${uniqueIdSuffix}`;
            const closeButton = this.add.dom(1380, 115).createFromHTML(`
                <button id="${closeButtonId}" class="close-button">X</button>`);
            
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
              this.updateChatLog(chatLogNode, 'Player', inputValue);
  
              const response = await chatManager.getCharacterResponse();
              chatManager.addMessage('assistant', response);
              this.updateChatLog(chatLogNode, 'Character', response);
  
              chatInputNode.value = '';
          }
      }
  }
  
}

export default ChatScene;
