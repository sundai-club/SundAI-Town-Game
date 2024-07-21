/**
 * Utility function to add colliders to a Phaser scene. Colliders prevent characters from moving through certain objects.
 * @param {Phaser.Scene} scene - The scene where the colliders will be added.
 * @returns {Phaser.Physics.Arcade.StaticGroup} The group of colliders added to the scene.
 */
export const addColliders = (scene) => {
  const colliders = scene.physics.add.staticGroup();
  
  /**
   * Creates and adds a single collider to the scene.
   * @param {number} x - The x-coordinate of the top-left corner of the collider.
   * @param {number} y - The y-coordinate of the top-left corner of the collider.
   * @param {number} width - The width of the collider.
   * @param {number} height - The height of the collider.
   */
  const createCollider = (x, y, width, height) => {
    const collider = colliders.create(x, y, null).setOrigin(0, 0).refreshBody().setVisible(false);
    collider.body.setSize(width, height);
  };

  createCollider(390, 105, 180, 130);
  createCollider(670, 105, 120, 140);
  createCollider(885, 105, 110, 125);
  createCollider(120, 270, 110, 175);
  createCollider(650, 310, 90, 125);
  createCollider(795, 310, 80, 105);
  createCollider(85, 550, 80, 105);
  createCollider(330, 570, 80, 125);
  createCollider(550, 570, 160, 140);
  createCollider(770, 580, 120, 80);
  createCollider(970, 510, 110, 160);
  createCollider(710, 750, 90, 100);
  createCollider(545, 750, 80, 90);

  return colliders;
};
