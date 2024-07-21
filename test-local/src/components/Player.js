/**
 * Represents the player character in the game, handling movement and animations.
 */
import Phaser from 'phaser';

class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * Constructs the player character with initial settings.
   * @param {Phaser.Scene} scene - The scene where the player will be active.
   * @param {number} x - The initial x-coordinate of the player.
   * @param {number} y - The initial y-coordinate of the player.
   */
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    this.scene = scene;

    scene.physics.world.enable (this);
    this.setCollideWorldBounds(true);

    scene.add.existing(this);
    this.setScale(2);
    this.body.setSize(25, 22);
    this.body.setOffset(8, 25);
    this.anims.play('playerIdle', true);
  }

  /**
   * Handles the player's input and updates the player's velocity and animation state.
   * @param {Phaser.Types.Input.Keyboard.CursorKeys} cursors - Cursor keys to control the player.
   * @param {number} speed - The speed at which the player moves.
   * @returns {boolean} Indicates whether the player is moving.
   */
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
