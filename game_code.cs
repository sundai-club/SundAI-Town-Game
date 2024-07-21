// ChatManager is already imported in the current scope.

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
    border-radius: 30px;
    color: #fff;
    background-color: #ff6347;
    font-size: 30px;
    text-align: center;
    line-height: 30px;
    cursor: pointer;
`;

class NPC extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, characterDescription, animKey, startFrame, endFrame, expertise) {
        super(scene, x, y, key);

        this.scene = scene;
        this.characterDescription = characterDescription;
        this.expertise = expertise;
        this.isChatting = false;
        this.chatLogId = 'chatLogContent-' + characterDescription.replace(/\s+/g, '-').toLowerCase();

        scene.physics.world.enable(this);
        this.setCollideWorldBounds(true);
        this.setInteractive();

        scene.add.existing(this);

        this.directionChangeTimer = 0;
        this.direction = 'down';

        this.isChatOpen = false;
        this.chatManager = new ChatManager(characterDescription);

        this.createAnimation(animKey, startFrame, endFrame);
        this.createOverlay();
    }

    setCursorStyle() {
        this.on('pointerover', () => {
            if (this.playerInRange(this.scene.player)) {
                this.scene.input.setDefaultCursor('pointer');
                this.showOverlay();
            }
        });

        this.on('pointerout', () => {
            this.scene.input.setDefaultCursor('default');
            this.hideOverlay();
        });
    }

    createOverlay() {
        this.overlay = this.scene.add.text(this.x, this.y - this.height, this.expertise, {
            font: '16px Arial',
            fill: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 5, y: 5 }
        });
        this.overlay.setOrigin(0.5, 1);
        this.overlay.setVisible(false);
    }

    showOverlay() {
        this.overlay.setVisible(true);
    }

    hideOverlay() {
        this.overlay.setVisible(false);
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

        this.overlay.setPosition(this.x, this.y - this.height);
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
        this.load.image('background', 'https://play.rosebud.ai/assets/new-kat-in-town-bg.png.png?WQt8');
        this.load.image('foreground', `https://play.rosebud.ai/assets/ai-town-foreground.png.png?ydFK`)
        this.load.spritesheet('player', `https://play.rosebud.ai/assets/cat_Walk.png.png?dNOl`, {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.spritesheet('playerIdle', `https://play.rosebud.ai/assets/cat_Idle.png.png?9azZ`, {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.spritesheet('girl', 'https://play.rosebud.ai/assets/watering-can-girl.png.png?xNPM', {
            frameWidth: 96,
            frameHeight: 64
        });
        this.load.spritesheet('boy', 'https://play.rosebud.ai/assets/digging-boy.png.png?xALO', {
            frameWidth: 96,
            frameHeight: 64
        });
        this.load.spritesheet('fishingguy', `https://play.rosebud.ai/assets/waiting01.png?LSfO`, {
            frameWidth: 96,
            frameHeight: 64
        });
        this.load.image('scroll', `https://play.rosebud.ai/assets/scrollpage03.png.png?Sznl`);
        this.load.audio('music', `https://play.rosebud.ai/assets/Game Village Shop RPG Theme (Endless Loop Version) - Elevate Audio.mp3.mp3?DSa0`);
    }

    create() {
        this.physics.world.setBounds(0, 0, 1080, 890);

        this.add.image(550, 445, 'background').setScale(1.25);
        this.add.image(1225, 445, 'scroll');

        this.anims.create({
            key: 'playerWalking',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'playerIdle',
            frames: this.anims.generateFrameNumbers('playerIdle', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });

        this.player = this.physics.add.sprite(360, 300, 'player').setScale(2);
        this.player.body.setSize(25, 22);
        this.player.body.setOffset(8, 25);
        this.player.setCollideWorldBounds(true);
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

        const music = this.sound.add('music', { volume: 0.05, loop: true });
        music.play();

        this.add.image(550, 445, 'foreground').setScale(1.25);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.fishingguy = new NPC(this, 656, 500, 'fishingguy', 'Kev is a huge fishing lover. His dream is to become a captain just like your uncle who left for his dream to travel the world..', 'fishingguy', 0, 3, 'Expert Fisherman').setScale(-2.5, 2.5);
        this.fishingguy.setInteractive();
        this.fishingguy.setCursorStyle();

        this.girl = new NPC(this, 1000, 300, 'girl', 'Ellie left home dreaming...', 'girl', 0, 4, 'Adventurer').setScale(3);
        this.girl.setInteractive();
        this.girl.setCursorStyle();

        this.boy = new NPC(this, 200, 170, 'boy', 'Kenji is a cheerful guy...', 'boy', 0, 7, 'Village Historian').setScale(3);
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

        const speed = 160;
        let isMoving = false;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
            isMoving = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
            isMoving = true;
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed);
            isMoving = true;
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed);
            isMoving = true;
        } else {
            this.player.setVelocityY(0);
        }

        this.player.anims.play(isMoving ? 'playerWalking' : 'playerIdle', true);

        this.fishingguy.update();
        this.girl.update();
        this.boy.update();
    }

    addCollider(x, y, width, height) {
        const collider = this.colliders.create(x, y, null);
        collider.setOrigin(0, 0);
        collider.setSize(width, height);
        collider.refreshBody();
        collider.setVisible(false);
    }

    openChat(npc) {
        if (this.isChatOpen) return;
        this.isChatOpen = true;

        const uniqueIdSuffix = npc.characterDescription.replace(/\s+/g, '-').toLowerCase();

        if (this.chatDialogs.has(npc)) {
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

            this.chatDialogs.set(npc, { chatLog, chatInput, sendButton, closeButton });
        }
    }

    closeChat() {
        if (!this.isChatOpen) return;
        this.isChatOpen = false;

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

const config = {
    parent: 'renderDiv',
    type: Phaser.AUTO,
    scene: ChatScene,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1400,
        height: 890,
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

window.phaserGame = new Phaser.Game(config);
