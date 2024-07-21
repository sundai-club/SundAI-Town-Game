import Phaser from 'phaser';
import ChatManager from './ChatManager';

class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, characterDescription, animKey, startFrame, endFrame) {
    super(scene, x, y, key);

    this.scene = scene;
    this.characterDescription = characterDescription;
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

export default NPC;
