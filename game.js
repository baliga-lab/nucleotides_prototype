(function (glob) {
    "use strict";

    var gameObj = null;

    // Frames in the tile set
    const NUC_U = 0;
    const NUC_T = 1;
    const NUC_G = 2;
    const NUC_C = 3;
    const NUC_A = 4;

    // ES6 notation to use the variable contents as the key and not the name
    const INV_NUCS = {
        [NUC_A]: [NUC_T, NUC_U],
        [NUC_C]: [NUC_G],
        [NUC_G]: [NUC_C],
        [NUC_T]: [NUC_A],
        [NUC_U]: [NUC_A]
    };
    var currentNucleotide = null;
    var currentBase = null;
    // **********************************************************************
    // ****** Game logic
    // **********************************************************************
    function randint(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function nextNucleotide() {
        currentBase = randint(0, 4);
        currentNucleotide = gameObj.add.sprite(170 + 30, 200 + 30, "tiles", currentBase)
            .setScale(0.5)

        // This simply fades in a nucleotide sprite
        gameObj.add.tween({
            targets: [currentNucleotide],
            ease: "Sine.easeInOut",
            duration: 1000,
            alpha: {
                getStart: () => 0.0,
                getEnd: () => 1.0
            },
            onComplete: () => {}
        });
    }

    function preload ()
    {
        // on initialization, we remember our current game object
        gameObj = this;
        this.load.image('isblogo', 'images/isb_color_logo1.png');
        this.load.spritesheet('tiles', 'images/tiles.png', { frameWidth: 120, frameHeight: 120});
    }

    function match(nuc) {
        var inverse = INV_NUCS[currentBase];
        var found = false;
        for (var i = 0; i < inverse.length; i++) {
            if (inverse[i] === nuc) {
                found = true;
                break;
            }
        }
        if (found) {
            // destroy the nucleotide and generate the next one
            currentNucleotide.destroy();
            nextNucleotide();
        } else {
            console.log("NO MATCH !!!");
        }
    }

    function onAClicked(ptr) {
        match(NUC_A);
    }
    function onCClicked(ptr) {
        match(NUC_C);
    }
    function onGClicked(ptr) {
        match(NUC_G);
    }
    function onTClicked(ptr) {
        match(NUC_T);
    }
    function onUClicked(ptr) {
        match(NUC_U);
    }

    function create ()
    {
        var isblogo = this.add.image(320, 30, "isblogo").setScale(0.3);

        var a = this.add.sprite(30 + 30, 400 + 30, "tiles", 4)
            .setScale(0.5).setInteractive();
        a.on('pointerdown', onAClicked);

        var c = this.add.sprite(100 + 30, 400 + 30, "tiles", 3)
            .setScale(0.5).setInteractive();
        c.on('pointerdown', onCClicked);

        var g = this.add.sprite(170 + 30, 400 + 30, "tiles", 2)
            .setScale(0.5).setInteractive();
        g.on('pointerdown', onGClicked);

        var t = this.add.sprite(240 + 30, 400 + 30, "tiles", 1)
            .setScale(0.5).setInteractive();
        t.on('pointerdown', onTClicked);

        var u = this.add.sprite(310 + 30, 400 + 30, "tiles", 0)
            .setScale(0.5).setInteractive();
        u.on('pointerdown', onUClicked);


        nextNucleotide();
    }

    function update ()
    {
        //console.log("x: " + this.input.x + " y: " + this.input.y);
    }

    // **********************************************************************
    // ****** Public API
    // **********************************************************************
    var game = { };
    game.version = '1.0.0';

    /* Create an initial board configuration */
    game.config = {
        type: Phaser.AUTO,
        width: 420,
        height: 500,
        backgroundColor: '#ccc',
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    // These lines needed to support a NPM/ES6 environment, the define() call
    // is to support RequireJS
    glob.game = game;
    typeof module != 'undefined' && module.exports ? module.exports = game : typeof define === "function" && define.amd ? define("game", [], function () { return game; }) : glob.game = game;
})(typeof window != "undefined" ? window : this);
