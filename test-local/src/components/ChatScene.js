import Phaser from 'phaser';
import NPC from './NPC';
import Player from './Player';
import { createAnimations } from './animations';
import { addColliders } from './colliders';

class ChatScene extends Phaser.Scene {
  preload() {
    this.load.image('background', '/assets/hoenn_remake__rustboro_city_by_yuysusl_d4y385y-fullview.jpg');
    //this.load.image('foreground', `https://play.rosebud.ai/assets/ai-town-foreground.png.png?R413`)
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
    //this.load.audio('music', `background-music.mp3`);
  }

  create() {
    this.physics.world.setBounds(0, 0, 1080, 890);

    this.add.image(550, 445, 'background').setScale(1.25);
    this.add.image(1225, 445, 'scroll');

    createAnimations(this);

    this.player = new Player(this, 360, 300);
    this.colliders = addColliders(this);
    this.physics.add.collider(this.player, this.colliders);

    this.chatDialogs = new Map();
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create NPCs
    this.fishingguy = new NPC(this, 656, 500, 'fishingguy', 'Kev is a huge fishing lover...', 'fishingguy', 0, 3).setScale(-2.5, 2.5);
    this.fishingguy.setInteractive();
    this.fishingguy.setCursorStyle();

    this.girl = new NPC(this, 1000, 300, 'girl', 'Ellie left home dreaming...', 'girl', 0, 4).setScale(3);
    this.girl.setInteractive();
    this.girl.setCursorStyle();

    this.boy = new NPC(this, 200, 170, 'boy', 'Kenji is a cheerful guy...', 'boy', 0, 7).setScale(3);
    this.boy.setInteractive();
    this.boy.setCursorStyle();

    // Input handling for chat
    this.input.on('gameobjectdown', (pointer, gameObject) => {
      if (gameObject instanceof NPC && gameObject.playerInRange(this.player)) {
        gameObject.openChat();
      }
    });

    // Music
    const music = this.sound.add('music', { volume: 0.05, loop: true });
    music.play();
  }

  update() {
    if (this.isChatOpen) {
      if (this.cursors.up.isDown || this.cursors.down.isDown || this.cursors.left.isDown || this.cursors.right.isDown) {
        this.closeChat();
      }
      return;
    }

    const isMoving = this.player.handleInput(this.cursors, 160);
    if (isMoving) {
      this.player.anims.play('playerWalking', true);
    } else {
      this.player.anims.play('playerIdle', true);
    }
  }

  // Chat handling methods...
}

export default ChatScene;
