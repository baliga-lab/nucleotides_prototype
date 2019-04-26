(function (glob) {
    "use strict";

    var gameObj = null;

    // Frames in the tile set
    const NUC_U = 0;
    const NUC_T = 1;
    const NUC_G = 2;
    const NUC_C = 3;
    const NUC_A = 4;

    const NUM_NUCLEOTIDES = 10;

    // ES6 notation to use the variable contents as the key and not the name
    const INV_NUCS = {
        [NUC_A]: [NUC_T, NUC_U],
        [NUC_C]: [NUC_G],
        [NUC_G]: [NUC_C],
        [NUC_T]: [NUC_A],
        [NUC_U]: [NUC_A]
    };

    // nucleotides
    var nucleotides = new Array();
    var currentNucleotide = null;

    // Score display
    var numMatches = 0;
    var numErrors = 0;
    var seqNTText = null;
    var seqNTs = 0;
    var rateText = null;
    var accuracyText = null;
    var scoreText = null;
    var score = 0;
    var timer = null;
    var secs = 0;

    var bgmusic = null;
    var bing = null;
    var buzz = null;
    // **********************************************************************
    // ****** Game logic
    // **********************************************************************
    function randint(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function computeAccuracy() {
        return Math.round(numMatches / (numMatches + numErrors) * 100);
    }

    function getNucScale(i) {
        var initScale = 0.5 / NUM_NUCLEOTIDES;
        return initScale + i * initScale;
    }
    function getNucPos(i) {
        var initX = 300;
        var initY = 200;
        var offsx = 15, offsy = 12;
        return {x: initX - offsx * i, y: initY + offsy * i}
    }

    function makeInitialNucleotides() {
        // start with initial scale 0.5 / NUM_NUCLEOTIDES and multiply scale
        // from back to front
        for (var i = 0; i < NUM_NUCLEOTIDES; i++) {
            var pos = getNucPos(i);
            var base = randint(0, 4);
            var nucleotide = {
                base: base,
                sprite: gameObj.add.sprite(pos.x, pos.y, "tiles", base)
                    .setScale(getNucScale(i))
            };
            nucleotides.push(nucleotide);
        }
        currentNucleotide = nucleotides[nucleotides.length - 1];
    }
    function nextNucleotide() {
        // 1. remove the last element and insert a new one at the beginning
        // 2. recompute scale and positions
        nucleotides.pop();
        currentNucleotide = nucleotides[nucleotides.length - 1];

        var base = randint(0, 4);

        // new nucleotide
        var pos = getNucPos(i);
        var nucleotide = {
            base: base,
            sprite: gameObj.add.sprite(pos.x, pos.y, "tiles", base)
                .setScale(getNucScale(0))
        };
        nucleotides.unshift(nucleotide);
        // From back to front to preserve draw order, actually we need to set
        // Sprite depth as well to make sure of that
        for (var i = nucleotides.length - 1; i > 0; i--) {
            var pos = getNucPos(i);
            nucleotides[i].sprite.setScale(getNucScale(i))
                .setPosition(pos.x, pos.y).setDepth(i);
        }
    }

    function updateRate() {
        secs += 1;
        var rate = Math.round(((numMatches + numErrors) / secs) * 60);
        rateText.text = rate;
    }

    function preload ()
    {
        // on initialization, we remember our current game object
        gameObj = this;
        this.load.image('isblogo', 'images/isb_color_logo1.png');
        this.load.spritesheet('tiles', 'images/tiles.png', { frameWidth: 120, frameHeight: 120});
        this.load.audio('bing', 'sounds/bell-short.wav');
        this.load.audio('buzz', 'sounds/error-buzz.wav');
        this.load.audio('bgmusic', 'sounds/tears_of_my_heart.mp3');
    }

    function match(nuc) {
        var inverse = INV_NUCS[currentNucleotide.base];
        var found = false;
        for (var i = 0; i < inverse.length; i++) {
            if (inverse[i] === nuc) {
                found = true;
                break;
            }
        }
        if (found) {
            // destroy the nucleotide and generate the next one
            currentNucleotide.sprite.destroy();
            nextNucleotide();

            // do score computations here
            numMatches += 1;
            seqNTs += 1;
            seqNTText.text = seqNTs;
            score += 10;
            scoreText.text = score;
            accuracyText.text = computeAccuracy() + '%';
            bing.once('play', function(sound) {
            }, this);
            bing.play();
        } else {
            // do score computations here
            numErrors += 1;
            seqNTs = 0;
            seqNTText.text = seqNTs;
            accuracyText.text = computeAccuracy() + '%';
            buzz.play();
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
        bing = this.sound.add('bing');
        buzz = this.sound.add('buzz');
        bgmusic = this.sound.add('bgmusic', {volume: 0.3});
        bgmusic.play();
        var isblogo = this.add.image(320, 30, "isblogo").setScale(0.3);
        this.add.text(10, 10, "Nucleotides",
                      {fontFamily: 'Helvetica, "sans serif"',
                       fontStyle: 'italic',
                       fontSize: '16pt', color: '#000'})

        this.add.text(10, 50, "Sequence NTs",
                      {fontFamily: 'Helvetica, "sans serif"', fontSize: '12pt', color: '#000'});
        seqNTText = this.add.text(10, 70, "0",
                                  {fontFamily: 'Helvetica, "sans serif"', fontSize: '12pt',
                                   color: '#000'});
        this.add.text(10, 100, "Rate (NTs per minute)",
                      {fontFamily: 'Helvetica, "sans serif"', fontSize: '12pt', color: '#000'});
        rateText = this.add.text(10, 120, "0",
                                 {fontFamily: 'Helvetica, "sans serif"', fontSize: '12pt',
                                  color: '#000'});

        this.add.text(10, 150, "Accuracy",
                      {fontFamily: 'Helvetica, "sans serif"', fontSize: '12pt', color: '#000'});
        accuracyText = this.add.text(10, 170, "0%",
                                     {fontFamily: 'Helvetica, "sans serif"', fontSize: '12pt',
                                      color: '#000'});

        this.add.text(10, 200, "Score",
                      {fontFamily: 'Helvetica, "sans serif"', fontSize: '12pt', color: '#000'});
        scoreText = this.add.text(10, 220, "0",
                                  {fontFamily: 'Helvetica, "sans serif"', fontSize: '12pt',
                                   color: '#000'});

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


        makeInitialNucleotides();

        timer = this.time.addEvent({
            delay: 1000,
            callback: updateRate,
            loop: true
        });
    }

    function update () { }

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
        backgroundColor: '#eee',
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
