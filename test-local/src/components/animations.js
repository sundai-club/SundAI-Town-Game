export const createAnimations = (scene) => {
    scene.anims.create({
      key: 'playerWalking',
      frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
  
    scene.anims.create({
      key: 'playerIdle',
      frames: scene.anims.generateFrameNumbers('playerIdle', { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1,
    });
  };
  