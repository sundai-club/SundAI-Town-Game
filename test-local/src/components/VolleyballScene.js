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
        this.quicksand = null;
        this.graphics = null;
        this.playerScore = 0;
        this.computerScore = 0;
        this.scoreText = null;
        this.jumps = 0;
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
        const ground = this.physics.add.staticGroup();
        ground.create(400, 580, 'ground').setDisplaySize(800, 40).refreshBody().setImmovable(true);

        // Create player
        this.player = this.physics.add.sprite(200, 500, 'player');
        this.player.setCollideWorldBounds(false);

        // Create computer player
        this.computerPlayer = this.physics.add.sprite(600, 500, 'player');
        this.computerPlayer.setCollideWorldBounds(false);
        this.computerPlayer.setTint(0xff0000);

        // Create net (as tall as the players)
        const netHeight = this.player.height;
        this.net = this.physics.add.staticImage(400, 580 - netHeight / 2, 'net').setDisplaySize(20, netHeight).setImmovable(true);

        // Add court lines
        this.graphics = this.add.graphics();
        this.drawCourtLines();

        // Add quicksand
        this.quicksand = this.add.image(125, 560, 'quicksand').setDisplaySize(150, 40);

        // Add text
        this.add.text(200, 50, 'Volleyball Court', { fontSize: '32px', fill: '#ffffff' });

        // Create ball
        this.ball = this.physics.add.sprite(400, 300, 'ball');
        this.ball.setCollideWorldBounds(true);
        this.ball.setBounce(1);
        this.ball.setCircle(this.ball.width / 2);
        this.ball.setScale(this.player.width / this.ball.width);

        // Set up collisions
        this.physics.add.collider(this.player, ground);
        this.physics.add.collider(this.computerPlayer, ground);
        this.physics.add.collider(this.ball, ground, this.ballHitGround, null, this);
        this.physics.add.collider(this.ball, this.net);
        this.physics.add.collider(this.player, this.net);
        this.physics.add.collider(this.computerPlayer, this.net);
        this.physics.add.overlap(this.player, this.ball, this.hitBall, null, this);
        this.physics.add.overlap(this.computerPlayer, this.ball, this.computerHitBall, null, this);

        // Set up cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // Add scoreboard
        this.scoreText = this.add.text(16, 16, 'Player: 0  Computer: 0', { fontSize: '32px', fill: '#ffffff' });       
  }


    drawCourtLines() {
        this.graphics.clear();
        this.graphics.lineStyle(2, 0xffffff, 1);
        this.graphics.strokeRect(50, 300, 350, 280);
        this.graphics.strokeRect(400, 300, 350, 280);
        this.graphics.moveTo(150, 300);
        this.graphics.lineTo(150, 580);
        this.graphics.moveTo(650, 300);
        this.graphics.lineTo(650, 580);
    }

  hitBall(player, ball) {
    const angle = Phaser.Math.Angle.Between(player.x, player.y, ball.x, ball.y);
    const speed = 300;
    ball.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
}

computerHitBall(player, ball) {
        // Improved aiming logic
        const targetX = Phaser.Math.Between(50, 390); // Random x within player's bounds
        const targetY = Phaser.Math.Between(300, 580); // Random y within player's bounds
        const angle = Phaser.Math.Angle.Between(player.x, player.y, targetX, targetY);
        const speed = 300;
        
        // Add some randomness to the angle for less perfect shots
        const randomAngle = angle + Phaser.Math.FloatBetween(-0.2, 0.2);
        
        ball.setVelocity(Math.cos(randomAngle) * speed, -Math.abs(Math.sin(randomAngle) * speed));
}
ballHitGround(ball, ground) {
    if (ball.x < 400) {
        this.computerScore++;
    } else {
        this.playerScore++;
    }
    this.updateScoreText();
    this.resetBall();
}

updateScoreText() {
    this.scoreText.setText('Player: ' + this.playerScore + '  Computer: ' + this.computerScore);
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

    // Constrain player to left side of the court
    this.player.x = Phaser.Math.Clamp(this.player.x, 50, 390);
    this.player.y = Phaser.Math.Clamp(this.player.y, 300, 580);

    // Quicksand effect
    if (this.isInQuicksand(this.player)) {
        this.player.setVelocityY(50); // Sink slowly
        this.jumps = 0; // Reset jumps in quicksand
    }
    else {
        // Double-jump logic
        if (this.player.body.touching.down) {
            this.jumps = 0; // Reset jumps when touching the ground
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            if (this.jumps < 2) {
                this.player.setVelocityY(-330);
                this.jumps++;
            }
        }

        // Accelerate downwards with down arrow key
        if (this.cursors.down.isDown && !this.player.body.touching.down) {
            this.player.setVelocityY(this.player.body.velocity.y + 20);
        }
    }

    // Computer player movement
    const dx = this.ball.x - this.computerPlayer.x;
    const dy = this.ball.y - this.computerPlayer.y;

    if (dx < -10 && this.computerPlayer.x > 410) {
        this.computerPlayer.setVelocityX(-320);
    } else if (dx > 10 && this.computerPlayer.x < 750) {
        this.computerPlayer.setVelocityX(320);
    } else {
        this.computerPlayer.setVelocityX(0);
    }

    if (dy < -50 && this.computerPlayer.body.touching.down) {
        this.computerPlayer.setVelocityY(-450);
    }

    // Constrain computer player to right side of the court
    this.computerPlayer.x = Phaser.Math.Clamp(this.computerPlayer.x, 410, 750);
    this.computerPlayer.y = Phaser.Math.Clamp(this.computerPlayer.y, 300, 546);

    // Restrict ball movement to the sides
    if (this.ball.x < 50 || this.ball.x > 750) {
        this.resetBall();
    }

    // Reset player positions if they are outside the court
    if (this.player.x < 50 || this.player.x > 390 || this.player.y < 300 || this.player.y > 580) {
        this.player.setPosition(200, 500);
        this.player.setVelocity(0, 0);
        this.jumps = 0;
    }

    if (this.computerPlayer.x < 410 || this.computerPlayer.x > 750 || this.computerPlayer.y < 300 || this.computerPlayer.y > 546) {
        this.computerPlayer.setPosition(600, 500);
        this.computerPlayer.setVelocity(0, 0);
    }
    console.log(this.player.x, this.player.y)
    if (this.player.x <= 60) {
        this.scene.start('ChatScene')
    }
}

resetBall() {
    this.ball.setPosition(400, 300);
    this.ball.setVelocity(0, 0);
    this.ball.body.reset(400, 300);
}

isInQuicksand(player) {
    return player.x > this.quicksand.x - this.quicksand.displayWidth / 2 &&
           player.x < this.quicksand.x + this.quicksand.displayWidth / 2 &&
           player.y + player.height / 2 > this.quicksand.y - this.quicksand.displayHeight / 2;
}


}
