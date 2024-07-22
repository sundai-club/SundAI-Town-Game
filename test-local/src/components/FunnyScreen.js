// src/components/FunnyScene.js

import Phaser from 'phaser';

class FunnyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FunnyScene' });
    }

    preload() {
        // Load any assets here if needed
    }

    create() {
        // Add funny text
        this.add.text(700, 400, 'Are you ready to launch a product in 1 day??', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(700, 500, 'Try not to get distracted by the volleyball matches...', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(700, 550, 'And get ready to get harassed by an MBA for your codefingers...', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

        // Add a start game button
        const startButton = this.add.text(700, 600, 'Get to the game!', { fontSize: '24px', fill: '#0f0' }).setOrigin(0.5);
        startButton.setInteractive();

        // Handle button click
        startButton.on('pointerdown', () => {
            this.scene.start('ChatScene'); // Change to your initial game scene
        });
    }
}

export default FunnyScene;
