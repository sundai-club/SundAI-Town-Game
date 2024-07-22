/**
 * Manages the primary gameplay scene in the game, including loading assets, creating and animating sprites, and handling user interactions.
 */
import Phaser from 'phaser';
import NPC from './NPC';
import Player from './Player';
import { createAnimations } from './animations';
import { addColliders } from './colliders';

class Building {
    constructor(x, y, width, height, isEnterable=false, scene=undefined, sceneKey='') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.isEnterable = isEnterable;
        this.scene = scene;
        // this.setScene = setScene;
        this.sceneKey = sceneKey;

        this.isActive = false;
        this.counter = 50;

        this.image = undefined;
    }

    enter(playerX, playerY, pressedUp) {
        console.log(`building image: ${this.image}`)
        if (!this.isEnterable){ return; }
        
        const distanceX = Math.abs(playerX - this.x);
        const distanceY = Math.abs(playerY - (this.y+(this.height/2)));

        let minDist = this.width/2
        console.log(`Distance X: ${distanceX}`)
        console.log(`Distance Y: ${distanceY}`)
        if (distanceX <= minDist && distanceY <= 20 ) {
            if (!this.isActive) {
                if (!this.image) {
                    this.image = this.scene.add.image(this.x, this.y + (this.height/2) - 20, 'enter_building_bubble');
                } else {
                    this.image.addToDisplayList()
                }
                this.isActive = true;
            } else if (pressedUp) {
                this.counter -= 1;
                if (this.counter <= 0) {this.scene.scene.start(this.sceneKey)}
            }
        } else {
            this.isActive = false;
            this.counter = 50;
            if (this.image) { this.image.removeFromDisplayList(); }
        }
    }
}

class ChatScene extends Phaser.Scene {

    constructor() {
        super('ChatScene')
        this.annoyingMessages = [
            "Hey! Want to join my startup for AI-powered toothbrushes?",
            "Let's schedule a quick sync to optimize our synergies!",
            "Have you heard about my blockchain solution for pet food?",
            "Can I pick your brain about my new disruptive app idea?",
            "Let's leverage our core competencies for a win-win situation!",
            "Want to grab a coffee and discuss growth hacking strategies?",
            "I'm looking for a co-founder for my revolutionary fidget spinner 2.0!",
            "Let's pivot our paradigm to a more agile methodology!",
            "Have you considered the potential ROI of investing in my startup?",
            "Want to hear about my groundbreaking idea for a social media platform for plants?"
        ];
    }


    /**
     * Preloads necessary game assets like images and audio.
     */
    preload() {
        this.load.image('background', '/assets/hoenn_remake__rustboro_city_by_yuysusl_d4y385y-fullview.jpg');
        this.load.image('enter_building_bubble', '/assets/pixel-speech-bubble.png');
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

        this.load.image('angryMBA', 'https://play.rosebud.ai/assets/an angry student wearing smart attire in a stardew valley style.png?16ny');
    }

    /**
     * Creates the main gameplay elements, including the background, player character, NPCs, and interactions.
     */
    create() {
        this.physics.world.setBounds(0, 0, 1080, 890);

        this.add.image(550, 445, 'background').setScale(1.25);
        // this.add.image(550, 445, 'enter_building_bubble').setScale(1.25);

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

        // Add the angry MBA student
        this.angryMBA = this.physics.add.image(400, 400, 'angryMBA').setScale(0.25);
        this.angryMBA.setCollideWorldBounds(true);

        // Add speech bubble for the angry MBA student
        this.speechBubble = this.add.text(0, 0, '', {
            fontSize: '16px',
            color: "black",
            backgroundColor: 'rgb(451, 247, 175)',
            padding: { x: 10, y: 5 },
            borderRadius: 10,
            visible: false,
            wordWrap: { width: 200 }, // Enable text wrapping
            align: 'center' // Center-align the text
        });


        this.input.on('gameobjectdown', (pointer, gameObject) => {
            if (gameObject instanceof NPC && gameObject.playerInRange(this.player)) {
                gameObject.openChat();
            }
        });

        this.colliders = this.physics.add.staticGroup();

        const buildingParams = [[299, 244, 123, 89, true, this, 'ComputerLabScene'], [300, 174, 87, 139], [609, 228, 99, 63], [802, 222, 117, 54], [903, 213, 55, 111], [729, 307, 70, 69], [743, 371, 51, 67], [807, 384, 53, 49], [896, 368, 71, 93], [870, 428, 70, 67], [204, 424, 57, 97], [267, 449, 52, 103], [295, 523, 70, 54], [348, 440, 70, 93], [427, 441, 71, 72], [223, 607, 70, 86], [155, 655, 51, 105], [281, 671, 79, 48], [426, 626, 53, 57], [428, 663, 82, 45], [625, 495, 130, 78], [845, 572, 196, 86], [903, 658, 55, 109], [728, 670, 80, 44], [804, 704, 119, 53]]
        this.buildings = buildingParams.map(params => {
            const building = new Building(...params);
            this.addCollider(building.x, building.y, building.width, building.height);
            return building;
        });
        this.physics.add.collider(this.player, this.colliders);

        this.chatDialogs = new Map();
        // Play the audio
        const music = this.sound.add('music', {
            volume: 0.05,
            loop: true
        });

        music.play();

        // this.add.image(550, 445, 'foreground').setScale(1.25);

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

    /**
     * Update method called on each frame of the game loop. Handles the movement of the player and checks for interactions.
     */
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

        // Move the angry MBA student towards the player
        const angle = Phaser.Math.Angle.Between(this.angryMBA.x, this.angryMBA.y, this.player.x, this.player.y);
        const distance = Phaser.Math.Distance.Between(this.angryMBA.x, this.angryMBA.y, this.player.x, this.player.y);
        
        if (distance > 100) {
            this.angryMBA.setVelocity(Math.cos(angle) * 100, Math.sin(angle) * 100);
            this.speechBubble.setVisible(false);
        } else {
            this.angryMBA.setVelocity(0, 0);
            if (!this.speechBubble.visible) {
                this.speechBubble.setText(this.getRandomAnnoyingMessage());
                this.speechBubble.setVisible(true);
            }
            this.speechBubble.setPosition(this.angryMBA.x - 100, this.angryMBA.y - 80);
        }

        // Ensure the speech bubble is always on top
        this.children.bringToTop(this.speechBubble);

        // check if in front of buildings
        this.buildings.forEach(building => {
            building.enter(this.player.x, this.player.y, cursors.up.isDown)
        })
    }

    getRandomAnnoyingMessage() {
        return this.annoyingMessages[Math.floor(Math.random() * this.annoyingMessages.length)];
    }


    /**
     * Adds a collider object to the scene at specified coordinates.
     * @param {number} x - The x-coordinate of the top-left corner of the collider.
     * @param {number} y - The y-coordinate of the top-left corner of the collider.
     * @param {number} width - The width of the collider.
     * @param {number} height - The height of the collider.
     */
    addCollider(x, y, width, height) {
        const collider = this.colliders.create(x, y, null).setOrigin(0, 0).refreshBody().setVisible(false);
        collider.body.setSize(width, height);
    }

    /**
     * Opens the chat interface when the player interacts with an NPC.
     * @param {NPC} npc - The NPC with which the player is interacting.
     */
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

    /**
     * Closes the chat interface, clearing any active chat dialogs.
     */
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

    /**
     * Updates the chat log with new messages.
     * @param {HTMLElement} chatLogNode - The DOM node representing the chat log.
     * @param {string} role - The role of the message sender ('Player' or 'Character').
     * @param {string} message - The content of the message.
     */
    updateChatLog(chatLogNode, role, message) {
        const color = role === 'Player' ? '#3d1e01' : '#8a0094';
        chatLogNode.innerHTML += `<p style="color: ${color};">${role}: ${message}</p>`;
        chatLogNode.scrollTop = chatLogNode.scrollHeight;
    }

    /**
     * Sends a chat message from the player to an NPC and updates the chat log with the response.
     * @param {NPC} npc - The NPC involved in the chat.
     * @param {ChatManager} chatManager - The chat manager handling the NPC's responses.
     * @param {string} chatInputId - The ID of the chat input element.
     * @param {string} chatLogId - The ID of the chat log element.
     */
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
