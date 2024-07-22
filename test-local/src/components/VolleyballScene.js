// Created this ComputerLabScene. Needs to add multiple characters if any
import Phaser from 'phaser';
import NPC from './NPC';
import Player from './Player';
import { createAnimations } from './animations';
import { addColliders } from './colliders';

export default class VolleyballScene extends Phaser.Scene {
    constructor ()
    {
        super('VolleyballScene');
        this.player = null;
        this.computerPlayer = null;
        this.ball = null;
        this.cursors = null;
        this.net = null;
        this.courtWalls = null;
        this.quicksand = null;
    }

  preload ()
  {
      this.load.image('sky', `https://play.rosebud.ai/assets/sky.png?HLCS`);
      this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
      this.load.image('net', 'https://labs.phaser.io/assets/sprites/columns.png');
      this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
      this.load.image('ball', 'https://play.rosebud.ai/assets/ball.png?fhFJ');
      this.load.image('quicksand', 'https://play.rosebud.ai/assets/quicksand.png?3dtW');
  }


  create ()
  {
      // Add sky background
      this.add.image(400, 300, 'sky');

      // Create ground
      const ground = this.physics.add.staticImage(400, 580, 'ground').setDisplaySize(800, 40);

      // Create net
      this.net = this.physics.add.staticImage(400, 450, 'net').setDisplaySize(20, 260);

      // Add court lines
      const graphics = this.add.graphics();
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeRect(50, 300, 350, 280);
      graphics.strokeRect(400, 300, 350, 280);
      graphics.moveTo(150, 300);
      graphics.lineTo(150, 580);
      graphics.moveTo(650, 300);
      graphics.lineTo(650, 580);

      // Add quicksand
      this.quicksand = this.add.image(125, 560, 'quicksand').setDisplaySize(150, 40);


      // Create invisible walls for the court
      this.courtWalls = this.physics.add.staticGroup();
      this.courtWalls.add(this.add.rectangle(50, 440, 10, 280).setOrigin(0, 0.5)); // Left wall
      this.courtWalls.add(this.add.rectangle(750, 440, 10, 280).setOrigin(1, 0.5)); // Right wall
      this.courtWalls.add(this.add.rectangle(400, 300, 700, 10).setOrigin(0.5, 0)); // Top wall
      this.courtWalls.add(this.add.rectangle(400, 580, 700, 10).setOrigin(0.5, 1)); // Bottom wall

      // Add text
      this.add.text(200, 50, 'Volleyball Court', { fontSize: '32px', fill: '#ffffff' });

      // Create player
      this.player = this.physics.add.sprite(200, 500, 'player');
      this.player.setCollideWorldBounds(false);
      this.player.body.setSize(this.player.width, this.player.height);
      this.player.body.setOffset(0, 0);

      // Create computer player
      this.computerPlayer = this.physics.add.sprite(600, 500, 'player');
      this.computerPlayer.setCollideWorldBounds(false);
      this.computerPlayer.setTint(0xff0000);
      this.computerPlayer.body.setSize(this.computerPlayer.width, this.computerPlayer.height);
      this.computerPlayer.body.setOffset(0, 0);

      // Create ball
      this.ball = this.physics.add.sprite(250, 400, 'ball'); // Changed initial position to x=250, y=400
      this.ball.setCollideWorldBounds(false);
      this.ball.setBounce(0.8);
      this.ball.setCircle(this.player.width / 2); // Set circular hitbox
      this.ball.setScale(this.player.width / this.ball.width); // Scale ball to player size

      // Set up collisions
      this.physics.add.collider(this.player, ground);
      this.physics.add.collider(this.computerPlayer, ground);
      this.physics.add.collider(this.ball, ground);
      this.physics.add.collider(this.ball, this.net);
      this.physics.add.collider(this.ball, this.courtWalls);
      this.physics.add.overlap(this.player, this.ball, this.hitBall, null, this);
      this.physics.add.overlap(this.computerPlayer, this.ball, this.computerHitBall, null, this);

      // Set up cursor keys
      this.cursors = this.input.keyboard.createCursorKeys();

      // Set world gravity
      this.physics.world.gravity.y = 300;        
  }

  hitBall(player, ball) {
    const angle = Phaser.Math.Angle.Between(player.x, player.y, ball.x, ball.y);
    const speed = 300;
    ball.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
}

computerHitBall(player, ball) {
    // Bounce the ball up and towards the left side
    const angle = Phaser.Math.Angle.Between(player.x, player.y, 200, 300); // Aim towards the left side
    const speed = 300;
    ball.setVelocity(Math.cos(angle) * speed, -Math.abs(Math.sin(angle) * speed)); // Ensure upward movement
}

update ()
{
    // Player movement
    if (this.cursors.left.isDown && this.player.x > 50)
    {
        this.player.setVelocityX(-160);
    }
    else if (this.cursors.right.isDown && this.player.x < 390)
    {
        this.player.setVelocityX(160);
    }
    else
    {
        this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.player.body.touching.down && !this.isInQuicksand(this.player))
        {
            this.player.setVelocityY(-330);
        }

    // Quicksand effect
    if (this.isInQuicksand(this.player)) {
        this.player.setVelocityY(50); // Sink slowly
    }


    // Constrain player to left side of the court
    this.player.x = Phaser.Math.Clamp(this.player.x, 50, 390);
    this.player.y = Phaser.Math.Clamp(this.player.y, 300, 546); // 546 is 580 (ground y) - 34 (player height)

    // Computer player movement (example: follow the ball)
    const dx = this.ball.x - this.computerPlayer.x;
    if (this.computerPlayer.x > 410 && this.computerPlayer.x < 750) {
        this.computerPlayer.setVelocityX(dx * 2);
    } else {
        this.computerPlayer.setVelocityX(0);
    }

    if (this.ball.y < this.computerPlayer.y && this.computerPlayer.body.touching.down) {
        this.computerPlayer.setVelocityY(-330);
    }

    // Constrain computer player to right side of the court
    this.computerPlayer.x = Phaser.Math.Clamp(this.computerPlayer.x, 410, 750);
    this.computerPlayer.y = Phaser.Math.Clamp(this.computerPlayer.y, 300, 546); // 546 is 580 (ground y) - 34 (player height)

    // Ensure players don't sink below the ground
    if (this.player.y > 546) {
        this.player.y = 546;
        this.player.body.velocity.y = 0;
    }
    if (this.computerPlayer.y > 546) {
        this.computerPlayer.y = 546;
        this.computerPlayer.body.velocity.y = 0;
    }

    // Additional check to prevent sinking
    if (this.player.body.bottom > 580) {
        this.player.y = 546;
        this.player.body.velocity.y = 0;
    }
    if (this.computerPlayer.body.bottom > 580) {
        this.computerPlayer.y = 546;
        this.computerPlayer.body.velocity.y = 0;
    }

    // Constrain ball to the court
    this.ball.x = Phaser.Math.Clamp(this.ball.x, 50, 750);
    this.ball.y = Phaser.Math.Clamp(this.ball.y, 300, 580);

    // Check if player should return to ChatScene
    if (this.player.x >= 750) {
        this.scene.start('ChatScene');
    }
}
isInQuicksand(player) {
    return player.x > this.quicksand.x - this.quicksand.displayWidth / 2 &&
           player.x < this.quicksand.x + this.quicksand.displayWidth / 2 &&
           player.y + player.height / 2 > this.quicksand.y - this.quicksand.displayHeight / 2;
}


}
