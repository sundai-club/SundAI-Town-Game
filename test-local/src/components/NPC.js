/**
 * NPC class extends Phaser's Sprite class, representing non-player characters in the game.
 * It manages the character's animations, interactions, and chat functionalities.
 */
import Phaser from 'phaser';
import ChatManager from './ChatManager';

class NPC extends Phaser.Physics.Arcade.Sprite {
  /**
   * Creates an instance of an NPC.
   * @param {Phaser.Scene} scene - The scene this NPC belongs to.
   * @param {number} x - The x position of the NPC in the scene.
   * @param {number} y - The y position of the NPC in the scene.
   * @param {string} key - The texture key to use for this NPC.
   * @param {string} characterDescription - A description of the NPC's character.
   * @param {string} animKey - The key for the animation this NPC will use.
   * @param {number} startFrame - The starting frame number for the animation.
   * @param {number} endFrame - The ending frame number for the animation.
   */
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

    // Add the text display above the NPC
    this.nameText = scene.add.text(x, y - 50, characterDescription, { fontSize: '20px', fill: '#A020FF', fontStyle: 'bold'});
    this.nameText.setOrigin(0.5, 0.5);
  }

  /**
   * Sets the cursor style when hovering over the NPC based on the proximity of the player.
   */
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

  /**
   * Updates the NPC's movement and behavior each frame, considering the direction and chatting status.
   */
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

  /**
   * Creates and initializes an animation for this NPC.
   * @param {string} animKey - The key for the animation.
   * @param {number} startFrame - The starting frame number for the animation.
   * @param {number} endFrame - The ending frame number for the animation.
   */
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

  /**
   * Opens the chat interface for this NPC, making it the active chat participant.
   */
  openChat() {
    this.isChatting = true;
    this.scene.openChat(this);
  }

  /**
   * Closes the chat interface, allowing the NPC to resume other behaviors.
   */
  closeChat() {
    this.isChatting = false;
  }

  /**
   * Checks if the player is within a certain range of this NPC.
   * @param {Phaser.GameObjects.GameObject} player - The player's game object.
   * @returns {boolean} True if the player is within interaction range, false otherwise.
   */
  playerInRange(player) {
    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    return distance < 230;
  }
}

export default NPC;
