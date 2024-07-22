// src/components/IntroScene.js

import Phaser from 'phaser';

class IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroScene' });
    }

    preload() {
        // Load any assets here if needed
    }

    create() {
        // Add intro text
        this.add.text(700, 400, 'Welcome to Sundai Club!', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        //this.add.text(700, 450, 'Get ready to get harassed by an MBA for your codefingers...', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(700, 450, 'The ultimate hackers community', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

        // Add a next button
        const nextButton = this.add.text(700, 500, 'Next', { fontSize: '24px', fill: '#0f0' }).setOrigin(0.5);
        nextButton.setInteractive();

        // Handle button click
        nextButton.on('pointerdown', () => {
            this.scene.start('FunnyScene');
        });
    }
}

export default IntroScene;
