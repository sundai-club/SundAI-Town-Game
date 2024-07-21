import Phaser from 'phaser';

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    this.scene = scene;

    scene.physics.world.enable(this);
    this.setCollideWorldBounds(true);

    scene.add.existing(this);
    this.setScale(2);
    this.body.setSize(25, 22);
    this.body.setOffset(8, 25);
    this.anims.play('playerIdle', true);
  }

  handleInput(cursors, speed) {
    let isMoving = false;

    if (cursors.left.isDown) {
      this.setVelocityX(-speed);
      this.setFlipX(true);
      isMoving = true;
    } else if (cursors.right.isDown) {
      this.setVelocityX(speed);
      this.setFlipX(false);
      isMoving = true;
    } else {
      this.setVelocityX(0);
    }

    if (cursors.up.isDown) {
      this.setVelocityY(-speed);
      isMoving = true;
    } else if (cursors.down.isDown) {
      this.setVelocityY(speed);
      isMoving = true;
    } else {
      this.setVelocityY(0);
    }

    return isMoving;
  }
}

export default Player;
