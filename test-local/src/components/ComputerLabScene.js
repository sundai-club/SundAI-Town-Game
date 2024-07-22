// Created this ComputerLabScene. Needs to add multiple characters if any
import Phaser from 'phaser';
import NPC from './NPC';
import Player from './Player';
import { createAnimations } from './animations';
import { addColliders } from './colliders';

export default class ComputerLabScene extends Phaser.Scene {
  constructor() {
      super('ComputerLabScene');
  }

  preload() {
      this.load.image('computerLab', 'https://play.rosebud.ai/assets/indoors.png?PSGI');
  }

  create() {
      this.add.image(700, 445, 'computerLab').setScale(1.5); // this will be updated based on where we want the player to start.

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
  }
}
