// Created this ComputerLabScene. Needs to add multiple characters if any
import Phaser from 'phaser';
import NPC from './NPC';
import Player from './Player';
import { createAnimations } from './animations';
import { addColliders } from './colliders';

export default class ComputerLabScene extends Phaser.Scene {
  constructor() {
      super('ComputerLabScene');
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

  preload() {
      this.load.image('HBS_BG', '/assets/HBS_BG.jpg');
      this.load.image('angryMBA', 'https://play.rosebud.ai/assets/an angry student wearing smart attire in a stardew valley style.png?16ny');
  }

  create() {
      this.add.image(700, 445, 'HBS_BG').setScale(1); // this will be updated based on where we want the player to start.

      this.angryMBA = this.physics.add.image(400, 400, 'angryMBA').setScale(0.25);
        this.angryMBA.setCollideWorldBounds(true);
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
      // Add player
      this.player = this.physics.add.sprite(100, 445, 'player').setScale(2);
      this.player.body.setSize(25, 22);
      this.player.body.setOffset(8, 25);
      this.player.setCollideWorldBounds(true);
      this.player.anims.play('playerIdle', true);

      this.cursors = this.input.keyboard.createCursorKeys();

      // Add exit area
      // this.exitArea = this.add.rectangle(50, 445, 20, 890, 0x00ff00, 0.3);
      // this.physics.add.existing(this.exitArea, true);
      // this.physics.add.overlap(this.player, this.exitArea, this.exitLab, null, this);
  }

  getRandomAnnoyingMessage() {
    return this.annoyingMessages[Math.floor(Math.random() * this.annoyingMessages.length)];
}

  update() {
      console.log(`${this.scene.key}: ${this.scene.isActive()}`);
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

      if (isMoving) {
          this.player.anims.play('playerWalking', true);
      } else {
          this.player.anims.play('playerIdle', true);
      }
      console.log(this.player.x)

      if (this.player.x <= 70) {
          this.scene.start('ChatScene')
          // this.scene.setActive(false, 'ComputerLabScene');
          // this.scene.setActive(true, 'ChatScene')
      }

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
  }
}
