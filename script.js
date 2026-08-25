"use strict";

/* =====================================================
   CITY QUEST
   MAIN GAME ENGINE
===================================================== */


/* =====================================================
   GAME CONFIG
===================================================== */

const GAME = {

    MAX_LEVEL: 200,

    WORLDS: [

        {
            id: 1,
            name: "NEON CITY",
            start: 1,
            end: 50,
            unlock: 1,
            multiplier: 1,

            buildings: [
                {
                    id: "neon_house",
                    name: "Neon House",
                    icon: "🏠",
                    price: 500
                },
                {
                    id: "cyber_shop",
                    name: "Cyber Shop",
                    icon: "🏪",
                    price: 1200
                },
                {
                    id: "energy_park",
                    name: "Energy Park",
                    icon: "🌳",
                    price: 2000
                },
                {
                    id: "mega_tower",
                    name: "Mega Tower",
                    icon: "🏢",
                    price: 5000
                }
            ]
        },

        {
            id: 2,
            name: "TROPICAL CITY",
            start: 51,
            end: 100,
            unlock: 50,
            multiplier: 1.5,

            buildings: [
                {
                    id: "beach_house",
                    name: "Beach House",
                    icon: "🏖️",
                    price: 2500
                },
                {
                    id: "resort",
                    name: "Luxury Resort",
                    icon: "🏝️",
                    price: 5000
                },
                {
                    id: "water_park",
                    name: "Water Park",
                    icon: "🌊",
                    price: 9000
                },
                {
                    id: "sky_resort",
                    name: "Sky Resort",
                    icon: "🏨",
                    price: 15000
                }
            ]
        },

        {
            id: 3,
            name: "FROST CITY",
            start: 101,
            end: 150,
            unlock: 100,
            multiplier: 2,

            buildings: [
                {
                    id: "ice_home",
                    name: "Ice Home",
                    icon: "🏠",
                    price: 8000
                },
                {
                    id: "winter_market",
                    name: "Winter Market",
                    icon: "🏪",
                    price: 15000
                },
                {
                    id: "ice_lab",
                    name: "Ice Lab",
                    icon: "🔬",
                    price: 25000
                },
                {
                    id: "crystal_tower",
                    name: "Crystal Tower",
                    icon: "🏙️",
                    price: 40000
                }
            ]
        },

        {
            id: 4,
            name: "SPACE CITY",
            start: 151,
            end: 200,
            unlock: 150,
            multiplier: 3,

            buildings: [
                {
                    id: "space_base",
                    name: "Space Base",
                    icon: "🛸",
                    price: 25000
                },
                {
                    id: "rocket_factory",
                    name: "Rocket Factory",
                    icon: "🚀",
                    price: 50000
                },
                {
                    id: "alien_market",
                    name: "Alien Market",
                    icon: "👽",
                    price: 75000
                },
                {
                    id: "space_station",
                    name: "Space Station",
                    icon: "🛰️",
                    price: 150000
                }
            ]
        }

    ]

};


/* =====================================================
   DEFAULT SAVE
===================================================== */

const DEFAULT_SAVE = {

    coins: 0,

    level: 1,

    highestLevelCompleted: 0,

    cities: {
        1: [],
        2: [],
        3: [],
        4: []
    }

};


let game = createDefaultSave();

let selectedWorldId = 1;

let currentChallenge = null;

let challengeTimer = null;

let animationFrame = null;

let challengeFinished = false;

let countdownTimer = null;


/* =====================================================
   ELEMENT HELPER
===================================================== */

function get(id) {

    return document.getElementById(id);

}


/* =====================================================
   SAVE CREATION
===================================================== */

function createDefaultSave() {

    return {

        coins: 0,

        level: 1,

        highestLevelCompleted: 0,

        cities: {
            1: [],
            2: [],
            3: [],
            4: []
        }

    };

}


/* =====================================================
   LOAD GAME
===================================================== */

function loadGame() {

    try {

        const saved =
            localStorage.getItem(
                "CITY_QUEST_SAVE"
            );

        if (!saved) {

            return;

        }

        const parsed =
            JSON.parse(saved);

        if (
            !parsed ||
            typeof parsed !== "object"
        ) {

            return;

        }

        game.coins =
            Number(parsed.coins) || 0;

        game.level =
            Math.min(
                GAME.MAX_LEVEL,
                Math.max(
                    1,
                    Number(parsed.level) || 1
                )
            );

        game.highestLevelCompleted =
            Math.max(
                0,
                Number(
                    parsed.highestLevelCompleted
                ) || 0
            );


        if (
            parsed.cities &&
            typeof parsed.cities === "object"
        ) {

            for (
                const world of GAME.WORLDS
            ) {

                if (
                    Array.isArray(
                        parsed.cities[
                            world.id
                        ]
                    )
                ) {

                    game.cities[
                        world.id
                    ] =
                        parsed.cities[
                            world.id
                        ].filter(
                            value =>
                                typeof value ===
                                "string"
                        );

                }

            }

        }

    } catch (error) {

        console.warn(
            "Save could not be loaded.",
            error
        );

        game =
            createDefaultSave();

    }

}


/* =====================================================
   SAVE GAME
===================================================== */

function saveGame() {

    try {

        localStorage.setItem(
            "CITY_QUEST_SAVE",
            JSON.stringify(game)
        );

    } catch (error) {

        console.warn(
            "Save could not be written.",
            error
        );

    }

}


/* =====================================================
   WORLD HELPERS
===================================================== */

function getWorldById(id) {

    return GAME.WORLDS.find(
        world =>
            world.id === id
    ) || null;

}


function getWorldForLevel(level) {

    return GAME.WORLDS.find(
        world =>
            level >= world.start &&
            level <= world.end
    ) || GAME.WORLDS[0];

}


function isWorldUnlocked(world) {

    return (
        game.highestLevelCompleted >=
        world.unlock
    );

}


/* =====================================================
   REWARDS
===================================================== */

function getReward(level) {

    const world =
        getWorldForLevel(level);

    const difficulty =
        Math.floor(
            (level - 1) / 20
        ) + 1;

    const base =
        100 +
        level * 30;

    const difficultyBonus =
        difficulty * 75;

    const milestoneBonus =
        level % 10 === 0
            ? base
            : 0;

    const worldBonus =
        level % 50 === 0
            ? base * 4
            : 0;

    const finalBonus =
        level === 200
            ? 100000
            : 0;

    return Math.floor(
        (
            base +
            difficultyBonus +
            milestoneBonus +
            worldBonus +
            finalBonus
        ) *
        world.multiplier
    );

}


/* =====================================================
   UI
===================================================== */

function updateUI() {

    const world =
        getWorldForLevel(
            game.level
        );

    const worldNumber =
        String(
            world.id
        ).padStart(
            2,
            "0"
        );


    get("coins").textContent =
        Math.floor(
            game.coins
        ).toLocaleString();


    get("level").textContent =
        game.level;


    get("currentLevel").textContent =
        game.level;


    get("rewardPreview").textContent =
        `REWARD: ${
            getReward(
                game.level
            ).toLocaleString()
        } 🪙`;


    get("homeWorldBadge").textContent =
        `WORLD ${worldNumber}`;


    get("homeWorldName").textContent =
        world.name;


    get("gameWorldBadge").textContent =
        `WORLD ${worldNumber} — ${world.name}`;

}


/* =====================================================
   SCREEN CONTROL
===================================================== */

function showScreen(screen) {

    get("homeScreen")
        .classList.add("hidden");

    get("gameScreen")
        .classList.add("hidden");

    get("cityScreen")
        .classList.add("hidden");


    screen
        .classList.remove("hidden");

}


/* =====================================================
   CLEAN CHALLENGE
===================================================== */

function stopChallenge() {

    if (
        challengeTimer !== null
    ) {

        clearInterval(
            challengeTimer
        );

        clearTimeout(
            challengeTimer
        );

        challengeTimer =
            null;

    }


    if (
        countdownTimer !== null
    ) {

        clearInterval(
            countdownTimer
        );

        clearTimeout(
            countdownTimer
        );

        countdownTimer =
            null;

    }


    if (
        animationFrame !== null
    ) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame =
            null;

    }


    document.onkeydown =
        null;

    document.onkeyup =
        null;

}


/* =====================================================
   CHALLENGE GENERATOR
===================================================== */

function createChallenge(level) {

    const difficulty =
        Math.min(
            10,
            Math.floor(
                (level - 1) / 20
            ) + 1
        );


    const types = [

        "target",

        "bomb",

        "reaction",

        "dodge",

        "safe",

        "sequence",

        "survival"

    ];


    const type =
        types[
            (level - 1) %
            types.length
        ];


    const variation =
        level % 6;


    return {

        level,

        difficulty,

        type,

        variation,

        lives:
            Math.max(
                1,
                4 -
                Math.floor(
                    difficulty / 4
                )
            ),

        targets:
            5 +
            difficulty * 2 +
            variation,

        reactions:
            2 +
            Math.floor(
                difficulty / 2
            ),

        reactionWindow:
            Math.max(
                250,
                1000 -
                difficulty * 65
            ),

        rounds:
            4 +
            difficulty +
            variation,

        length:
            3 +
            difficulty +
            variation,

        time:
            Math.max(
                6,
                18 -
                difficulty
            ),

        enemies:
            2 +
            difficulty

    };

}


/* =====================================================
   CHALLENGE NAME
===================================================== */

function getChallengeName(challenge) {

    const names = {

        target:
            "🎯 TARGET RUSH",

        bomb:
            "💣 BOMB DEFUSER",

        reaction:
            "⚡ LIGHTNING REACTION",

        dodge:
            "👾 DANGER ZONE",

        safe:
            "🟢 FIND THE SAFE ONE",

        sequence:
            "🔢 CODE BREAKER",

        survival:
            "🔥 SURVIVAL STORM"

    };


    return (
        names[
            challenge.type
        ] ||
        "⚡ CHALLENGE"
    );

}


/* =====================================================
   START LEVEL
===================================================== */

function startLevel() {

    stopChallenge();

    currentChallenge =
        createChallenge(
            game.level
        );

    challengeFinished =
        false;


    get("challengeArena")
        .innerHTML = "";


    get("challengeControls")
        .innerHTML = "";


    get("challengeMessage")
        .textContent = "";


    get("challengeTitle")
        .textContent =
        getChallengeName(
            currentChallenge
        );


    get("lives")
        .textContent =
        currentChallenge.lives;


    get("combo")
        .textContent =
        "0";


    get("timer")
        .textContent =
        currentChallenge.time;


    let count = 3;


    get("challengeIntro")
        .textContent =
        count;


    countdownTimer =
        setInterval(
            () => {

                count--;


                if (
                    count > 0
                ) {

                    get(
                        "challengeIntro"
                    ).textContent =
                        count;

                } else {

                    clearInterval(
                        countdownTimer
                    );

                    countdownTimer =
                        null;


                    get(
                        "challengeIntro"
                    ).textContent =
                        "GO!";


                    launchChallenge(
                        currentChallenge
                    );

                }

            },
            500
        );

}


/* =====================================================
   LAUNCH CHALLENGE
===================================================== */

function launchChallenge(challenge) {

    switch (
        challenge.type
    ) {

        case "target":

            launchTarget(
                challenge
            );

            break;


        case "bomb":

            launchBombDefuser(
                challenge
            );

            break;


        case "reaction":

            launchReaction(
                challenge
            );

            break;


        case "dodge":

            launchDodge(
                challenge
            );

            break;


        case "safe":

            launchSafe(
                challenge
            );

            break;


        case "sequence":

            launchSequence(
                challenge
            );

            break;


        case "survival":

            launchSurvival(
                challenge
            );

            break;

    }

}


/* =====================================================
   TARGET RUSH
===================================================== */

function launchTarget(challenge) {

    let hits = 0;


    const target =
        document.createElement(
            "button"
        );


    target.className =
        "challenge-target";


    target.type =
        "button";


    target.textContent =
        "🎯";


    get("challengeArena")
        .appendChild(
            target
        );


    function move() {

        if (
            challengeFinished
        ) {

            return;

        }


        const arena =
            get("challengeArena");


        const maxX =
            Math.max(
                1,
                arena.clientWidth -
                target.offsetWidth
            );


        const maxY =
            Math.max(
                1,
                arena.clientHeight -
                target.offsetHeight
            );


        target.style.left =
            `${
                Math.random() *
                maxX
            }px`;


        target.style.top =
            `${
                Math.random() *
                maxY
            }px`;

    }


    target.onclick =
        () => {

            if (
                challengeFinished
            ) {

                return;

            }


            hits++;


            get("combo")
                .textContent =
                hits;


            if (
                hits >=
                challenge.targets
            ) {

                winLevel(
                    hits
                );

                return;

            }


            move();

        };


    move();


    startTimer(
        challenge.time
    );

}


/* =====================================================
   BOMB DEFUSER
===================================================== */

function launchBombDefuser(challenge) {

    const arena =
        get("challengeArena");


    arena.innerHTML =
        "";


    arena.style.display =
        "block";


    arena.style.padding =
        "20px";


    let round = 0;


    let currentBomb =
        null;


    let roundTimeout =
        null;


    let roundInterval =
        null;


    const title =
        document.createElement(
            "div"
        );


    title.style.textAlign =
        "center";


    title.style.fontSize =
        "55px";


    title.style.marginTop =
        "20px";


    title.textContent =
        "💣";


    arena.appendChild(
        title
    );


    const instruction =
        document.createElement(
            "div"
        );


    instruction.style.textAlign =
        "center";


    instruction.style.fontSize =
        "20px";


    instruction.style.fontWeight =
        "1000";


    instruction.style.margin =
        "15px";


    arena.appendChild(
        instruction
    );


    const wires =
        document.createElement(
            "div"
        );


    wires.style.display =
        "grid";


    wires.style.gridTemplateColumns =
        "repeat(2, minmax(100px, 1fr))";


    wires.style.gap =
        "15px";


    wires.style.maxWidth =
        "500px";


    wires.style.margin =
        "25px auto";


    arena.appendChild(
        wires
    );


    const colors = [

        {
            name: "RED",
            emoji: "🔴"
        },

        {
            name: "BLUE",
            emoji: "🔵"
        },

        {
            name: "GREEN",
            emoji: "🟢"
        },

        {
            name: "YELLOW",
            emoji: "🟡"
        },

        {
            name: "PURPLE",
            emoji: "🟣"
        },

        {
            name: "ORANGE",
            emoji: "🟠"
        }

    ];


    function clearRoundTimers() {

        if (
            roundTimeout !==
            null
        ) {

            clearTimeout(
                roundTimeout
            );

            roundTimeout =
                null;

        }


        if (
            roundInterval !==
            null
        ) {

            clearInterval(
                roundInterval
            );

            roundInterval =
                null;

        }

    }


    function startRound() {

        if (
            challengeFinished
        ) {

            return;

        }


        clearRoundTimers();


        wires.innerHTML =
            "";


        const wireCount =
            Math.min(
                6,
                3 +
                Math.floor(
                    challenge.difficulty / 2
                )
            );


        const shuffled =
            [...colors]
                .sort(
                    () =>
                        Math.random() - 0.5
                )
                .slice(
                    0,
                    wireCount
                );


        const correct =
            shuffled[
                Math.floor(
                    Math.random() *
                    shuffled.length
                )
            ];


        currentBomb =
            correct;


        const instructions = [

            `CUT THE ${correct.name} WIRE!`,

            `DISARM USING ${correct.name}!`,

            `FIND ${correct.name}!`

        ];


        instruction.textContent =
            instructions[
                Math.floor(
                    Math.random() *
                    instructions.length
                )
            ];


        shuffled.forEach(
            color => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "challenge-action";


                button.style.minHeight =
                    "75px";


                button.style.fontSize =
                    "18px";


                button.textContent =
                    `${color.emoji} ${color.name}`;


                button.onclick =
                    () => {

                        if (
                            challengeFinished
                        ) {

                            return;

                        }


                        clearRoundTimers();


                        if (
                            color.name ===
                            currentBomb.name
                        ) {

                            round++;


                            get("combo")
                                .textContent =
                                round;


                            if (
                                round >=
                                challenge.rounds
                            ) {

                                winLevel(
                                    round
                                );

                                return;

                            }


                            showToast(
                                "⚡ CORRECT WIRE!"
                            );


                            startRound();

                        } else {

                            showToast(
                                "💥 WRONG WIRE!"
                            );


                            loseLife();


                            if (
                                !challengeFinished
                            ) {

                                startRound();

                            }

                        }

                    };


                wires.appendChild(
                    button
                );

            }
        );


        const roundTime =
            Math.max(
                1200,
                4500 -
                challenge.difficulty *
                300
            );


        let remaining =
            roundTime;


        get("timer")
            .textContent =
            (
                remaining / 1000
            ).toFixed(1);


        roundInterval =
            setInterval(
                () => {

                    if (
                        challengeFinished
                    ) {

                        clearRoundTimers();

                        return;

                    }


                    remaining -=
                        100;


                    get("timer")
                        .textContent =
                        Math.max(
                            0,
                            remaining / 1000
                        ).toFixed(1);


                    if (
                        remaining <= 0
                    ) {

                        clearRoundTimers();


                        showToast(
                            "💥 TOO SLOW!"
                        );


                        loseLife();


                        if (
                            !challengeFinished
                        ) {

                            startRound();

                        }

                    }

                },
                100
            );


        roundTimeout =
            setTimeout(
                () => {

                    clearRoundTimers();

                },
                roundTime
            );

    }


    startRound();

}


/* =====================================================
   LIGHTNING REACTION
===================================================== */

function launchReaction(challenge) {

    let round = 0;

    let ready = false;

    let waiting = false;

    let signalTimeout = null;

    let reactionTimeout = null;


    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "challenge-action";


    button.textContent =
        "WAIT...";


    get("challengeControls")
        .appendChild(
            button
        );


    function nextRound() {

        ready = false;

        waiting = true;


        button.textContent =
            "WAIT...";


        const delay =
            600 +
            Math.random() *
            1400;


        signalTimeout =
            setTimeout(
                () => {

                    if (
                        challengeFinished
                    ) {

                        return;

                    }


                    ready = true;

                    waiting = false;


                    button.textContent =
                        "⚡ CLICK!";


                    reactionTimeout =
                        setTimeout(
                            () => {

                                if (
                                    ready
                                ) {

                                    ready =
                                        false;

                                    loseLife();

                                }

                            },
                            challenge.reactionWindow
                        );

                },
                delay
            );

    }


    button.onclick =
        () => {

            if (
                challengeFinished
            ) {

                return;

            }


            if (
                waiting ||
                !ready
            ) {

                loseLife();

                return;

            }


            clearTimeout(
                reactionTimeout
            );


            clearTimeout(
                signalTimeout
            );


            ready = false;


            round++;


            get("combo")
                .textContent =
                round;


            if (
                round >=
                challenge.reactions
            ) {

                winLevel(
                    round
                );

                return;

            }


            nextRound();

        };


    nextRound();

}


/* =====================================================
   DANGER ZONE
===================================================== */

function launchDodge(challenge) {

    const arena =
        get("challengeArena");


    const player =
        document.createElement(
            "div"
        );


    player.className =
        "dodge-player";


    arena.appendChild(
        player
    );


    let x =
        arena.clientWidth / 2 -
        21;


    let y =
        arena.clientHeight / 2 -
        21;


    const keys = {};


    document.onkeydown =
        event => {

            keys[
                event.key.toLowerCase()
            ] = true;

        };


    document.onkeyup =
        event => {

            keys[
                event.key.toLowerCase()
            ] = false;

        };


    const enemies = [];


    for (
        let i = 0;
        i < challenge.enemies;
        i++
    ) {

        const enemy =
            document.createElement(
                "div"
            );


        enemy.className =
            "dodge-enemy";


        enemy.x =
            Math.random() *
            Math.max(
                1,
                arena.clientWidth -
                30
            );


        enemy.y =
            Math.random() *
            Math.max(
                1,
                arena.clientHeight -
                30
            );


        enemy.vx =
            (
                Math.random() -
                0.5
            ) *
            (
                1.5 +
                challenge.difficulty *
                0.3
            );


        enemy.vy =
            (
                Math.random() -
                0.5
            ) *
            (
                1.5 +
                challenge.difficulty *
                0.3
            );


        arena.appendChild(
            enemy
        );


        enemies.push(
            enemy
        );

    }


    const start =
        performance.now();


    function loop(now) {

        if (
            challengeFinished
        ) {

            return;

        }


        const elapsed =
            (
                now -
                start
            ) / 1000;


        if (
            elapsed >=
            challenge.time
        ) {

            winLevel();

            return;

        }


        const speed =
            3.5 +
            challenge.difficulty *
            0.3;


        if (
            keys.w ||
            keys.arrowup
        ) {

            y -= speed;

        }


        if (
            keys.s ||
            keys.arrowdown
        ) {

            y += speed;

        }


        if (
            keys.a ||
            keys.arrowleft
        ) {

            x -= speed;

        }


        if (
            keys.d ||
            keys.arrowright
        ) {

            x += speed;

        }


        x =
            Math.max(
                0,
                Math.min(
                    arena.clientWidth -
                    42,
                    x
                )
            );


        y =
            Math.max(
                0,
                Math.min(
                    arena.clientHeight -
                    42,
                    y
                )
            );


        player.style.left =
            `${x}px`;


        player.style.top =
            `${y}px`;


        for (
            const enemy of enemies
        ) {

            enemy.x +=
                enemy.vx;


            enemy.y +=
                enemy.vy;


            if (
                enemy.x <= 0 ||
                enemy.x >=
                arena.clientWidth -
                30
            ) {

                enemy.vx *= -1;

            }


            if (
                enemy.y <= 0 ||
                enemy.y >=
                arena.clientHeight -
                30
            ) {

                enemy.vy *= -1;

            }


            enemy.style.left =
                `${enemy.x}px`;


            enemy.style.top =
                `${enemy.y}px`;


            if (
                collision(
                    player,
                    enemy
                )
            ) {

                loseLife();


                enemy.x =
                    Math.random() *
                    Math.max(
                        1,
                        arena.clientWidth -
                        30
                    );


                enemy.y =
                    Math.random() *
                    Math.max(
                        1,
                        arena.clientHeight -
                        30
                    );

            }

        }


        get("timer")
            .textContent =
            Math.max(
                0,
                Math.ceil(
                    challenge.time -
                    elapsed
                )
            );


        animationFrame =
            requestAnimationFrame(
                loop
            );

    }


    animationFrame =
        requestAnimationFrame(
            loop
        );

}


/* =====================================================
   FIND THE SAFE ONE
===================================================== */

function launchSafe(challenge) {

    let round = 0;


    function spawn() {

        if (
            challengeFinished
        ) {

            return;

        }


        const arena =
            get("challengeArena");


        arena.innerHTML =
            "";


        const count =
            Math.min(
                10,
                3 +
                challenge.difficulty
            );


        const safe =
            Math.floor(
                Math.random() *
                count
            );


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                i === safe
                    ? "challenge-safe"
                    : "challenge-target";


            button.textContent =
                i === safe
                    ? "✓"
                    : "✕";


            button.style.left =
                `${10 +
                    Math.random() * 75}%`;


            button.style.top =
                `${10 +
                    Math.random() * 70}%`;


            button.onclick =
                () => {

                    if (
                        i !== safe
                    ) {

                        loseLife();

                        return;

                    }


                    round++;


                    get("combo")
                        .textContent =
                        round;


                    if (
                        round >=
                        challenge.rounds
                    ) {

                        winLevel(
                            round
                        );

                    } else {

                        spawn();

                    }

                };


            arena.appendChild(
                button
            );

        }

    }


    spawn();

}


/* =====================================================
   CODE BREAKER
===================================================== */

function launchSequence(challenge) {

    const arena =
        get("challengeArena");


    const display =
        document.createElement(
            "div"
        );


    display.className =
        "number-display";


    arena.appendChild(
        display
    );


    const input =
        document.createElement(
            "input"
        );


    input.type =
        "text";


    input.inputMode =
        "numeric";


    input.placeholder =
        "ENTER THE CODE";


    input.className =
        "challenge-action";


    get("challengeControls")
        .appendChild(
            input
        );


    const sequence = [];


    for (
        let i = 0;
        i < challenge.length;
        i++
    ) {

        sequence.push(
            Math.floor(
                Math.random() * 9
            ) + 1
        );

    }


    let index = 0;


    function showNext() {

        if (
            challengeFinished
        ) {

            return;

        }


        display.textContent =
            sequence[index];


        setTimeout(
            () => {

                display.textContent =
                    "•";


                index++;


                if (
                    index <
                    sequence.length
                ) {

                    setTimeout(
                        showNext,
                        200
                    );

                } else {

                    input.focus();

                }

            },
            Math.max(
                300,
                750 -
                challenge.difficulty *
                35
            )
        );

    }


    input.onkeydown =
        event => {

            if (
                event.key !==
                "Enter"
            ) {

                return;

            }


            if (
                input.value.trim() ===
                sequence.join("")
            ) {

                winLevel(
                    challenge.length
                );

            } else {

                input.value =
                    "";

                loseLife();

            }

        };


    setTimeout(
        showNext,
        500
    );

}


/* =====================================================
   SURVIVAL STORM
===================================================== */

function launchSurvival(challenge) {

    let remaining =
        challenge.time;


    let score = 0;


    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "challenge-action";


    button.textContent =
        "⚡ TAP FOR POWER";


    get("challengeControls")
        .appendChild(
            button
        );


    button.onclick =
        () => {

            if (
                challengeFinished
            ) {

                return;

            }


            score++;


            get("combo")
                .textContent =
                score;

        };


    get("timer")
        .textContent =
        remaining;


    challengeTimer =
        setInterval(
            () => {

                if (
                    challengeFinished
                ) {

                    return;

                }


                remaining--;


                get("timer")
                    .textContent =
                    remaining;


                if (
                    remaining <= 0
                ) {

                    clearInterval(
                        challengeTimer
                    );


                    challengeTimer =
                        null;


                    winLevel(
                        score
                    );

                }

            },
            1000
        );

}


/* =====================================================
   TIMER
===================================================== */

function startTimer(seconds) {

    let remaining =
        seconds;


    get("timer")
        .textContent =
        remaining;


    challengeTimer =
        setInterval(
            () => {

                if (
                    challengeFinished
                ) {

                    return;

                }


                remaining--;


                get("timer")
                    .textContent =
                    remaining;


                if (
                    remaining <= 0
                ) {

                    clearInterval(
                        challengeTimer
                    );


                    challengeTimer =
                        null;


                    loseLife();

                }

            },
            1000
        );

}


/* =====================================================
   COLLISION
===================================================== */

function collision(a, b) {

    const aRect =
        a.getBoundingClientRect();


    const bRect =
        b.getBoundingClientRect();


    return !(
        aRect.right <
        bRect.left ||

        aRect.left >
        bRect.right ||

        aRect.bottom <
        bRect.top ||

        aRect.top >
        bRect.bottom
    );

}


/* =====================================================
   LOSE LIFE
===================================================== */

function loseLife() {

    if (
        !currentChallenge ||
        challengeFinished
    ) {

        return;

    }


    currentChallenge.lives--;


    get("lives")
        .textContent =
        currentChallenge.lives;


    get("combo")
        .textContent =
        "0";


    if (
        currentChallenge.lives <= 0
    ) {

        failLevel();

        return;

    }


    showToast(
        "💥 HIT! KEEP GOING!"
    );

}


/* =====================================================
   WIN LEVEL
===================================================== */

function winLevel(score = 1) {

    if (
        challengeFinished
    ) {

        return;

    }


    challengeFinished =
        true;


    stopChallenge();


    const completed =
        game.level;


    const baseReward =
        getReward(
            completed
        );


    const scoreBonus =
        Math.max(
            0,
            Math.floor(
                score * 15
            )
        );


    const perfectLives =
        Math.max(
            1,
            4 -
            Math.floor(
                currentChallenge.difficulty /
                4
            )
        );


    const perfect =
        currentChallenge.lives ===
        perfectLives;


    const perfectBonus =
        perfect
            ? Math.floor(
                baseReward * 0.25
            )
            : 0;


    const total =
        baseReward +
        scoreBonus +
        perfectBonus;


    game.coins +=
        total;


    game.highestLevelCompleted =
        Math.max(
            game.highestLevelCompleted,
            completed
        );


    if (
        completed <
        GAME.MAX_LEVEL
    ) {

        game.level =
            completed + 1;

    }


    saveGame();


    updateUI();


    if (
        completed === 200
    ) {

        showToast(
            `👑 LEVEL 200 COMPLETE! +${total.toLocaleString()} 🪙`
        );

        return;

    }


    if (
        completed % 50 === 0
    ) {

        showToast(
            `🌍 NEW WORLD UNLOCKED! +${total.toLocaleString()} 🪙`
        );

    } else {

        showToast(
            `🔥 LEVEL ${completed} COMPLETE! +${total.toLocaleString()} 🪙`
        );

    }


    setTimeout(
        () => {

            if (
                !get("gameScreen")
                    .classList
                    .contains("hidden")
            ) {

                startLevel();

            }

        },
        900
    );

}


/* =====================================================
   FAIL LEVEL
===================================================== */

function failLevel() {

    challengeFinished =
        true;


    stopChallenge();


    get("challengeMessage")
        .textContent =
        "💥 LEVEL FAILED";


    showToast(
        "💥 TRY AGAIN!"
    );


    setTimeout(
        () => {

            startLevel();

        },
        900
    );

}


/* =====================================================
   TOAST
===================================================== */

let toastTimeout =
    null;


function showToast(message) {

    const element =
        get("toast");


    element.textContent =
        message;


    element.classList.add(
        "show"
    );


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
        setTimeout(
            () => {

                element.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =====================================================
   CITY THEME
===================================================== */

function updateCityTheme() {

    const map =
        get("cityMap");


    if (!map) {

        return;

    }


    const themes = {

        1: "theme-neon",

        2: "theme-tropical",

        3: "theme-frost",

        4: "theme-space"

    };


    map.className =
        "city-map";


    map.classList.add(
        themes[
            selectedWorldId
        ] ||
        "theme-neon"
    );

}


/* =====================================================
   RENDER CITY
===================================================== */

function renderCity() {

    const world =
        getWorldById(
            selectedWorldId
        );


    if (!world) {

        return;

    }


    updateCityTheme();


    get("cityWorldBadge")
        .textContent =
        `WORLD ${
            String(world.id)
                .padStart(
                    2,
                    "0"
                )
        }`;


    get("cityWorldName")
        .textContent =
        world.name;


    get("selectedWorldNumber")
        .textContent =
        `WORLD ${world.id}`;


    const unlocked =
        isWorldUnlocked(
            world
        );


    get("lockedWorldMessage")
        .classList.toggle(
            "hidden",
            unlocked
        );


    get("cityContent")
        .classList.toggle(
            "hidden",
            !unlocked
        );


    if (!unlocked) {

        get("unlockRequirement")
            .textContent =
            `Complete level ${world.unlock} to unlock this world.`;

        return;

    }


    renderBuildings(
        world
    );


    renderBuildingShop(
        world
    );

}


/* =====================================================
   RENDER BUILDINGS
===================================================== */

function renderBuildings(world) {

    const grid =
        get("cityGrid");


    grid.innerHTML =
        "";


    const owned =
        game.cities[
            world.id
        ] || [];


    const totalSlots =
        12;


    for (
        let i = 0;
        i < totalSlots;
        i++
    ) {

        const buildingId =
            owned[i];


        const slot =
            document.createElement(
                "div"
            );


        if (!buildingId) {

            slot.className =
                "empty-plot";


            slot.innerHTML =
                "🏗️";


            slot.style.display =
                "flex";


            slot.style.alignItems =
                "center";


            slot.style.justifyContent =
                "center";


            slot.style.opacity =
                "0.35";

        } else {

            const building =
                world.buildings.find(
                    item =>
                        item.id ===
                        buildingId
                );


            if (!building) {

                continue;

            }


            slot.className =
                "city-building";


            slot.innerHTML = `

                <div class="building-icon">
                    ${building.icon}
                </div>

                <div class="building-name">
                    ${building.name}
                </div>

            `;

        }


        grid.appendChild(
            slot
        );

    }

}


/* =====================================================
   BUILDING SHOP
===================================================== */

function renderBuildingShop(world) {

    const shop =
        get("buildingShop");


    shop.innerHTML =
        "";


    for (
        const building of
        world.buildings
    ) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "building-card";


        const owned =
            (
                game.cities[
                    world.id
                ] || []
            ).includes(
                building.id
            );


        card.innerHTML = `

            <div class="building-icon">
                ${building.icon}
            </div>

            <strong>
                ${building.name}
            </strong>

            <div>
                ${building.price.toLocaleString()} 🪙
            </div>

        `;


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.textContent =
            owned
                ? "OWNED ✓"
                : "BUILD";


        button.disabled =
            owned;


        button.onclick =
            () => {

                buyBuilding(
                    world,
                    building
                );

            };


        card.appendChild(
            button
        );


        shop.appendChild(
            card
        );

    }

}


/* =====================================================
   BUY BUILDING
===================================================== */

function buyBuilding(
    world,
    building
) {

    if (
        !isWorldUnlocked(
            world
        )
    ) {

        return;

    }


    const owned =
        game.cities[
            world.id
        ] || [];


    if (
        owned.includes(
            building.id
        )
    ) {

        showToast(
            "🏢 YOU ALREADY OWN THIS!"
        );

        return;

    }


    if (
        game.coins <
        building.price
    ) {

        showToast(
            "🪙 NOT ENOUGH COINS!"
        );

        return;

    }


    game.coins -=
        building.price;


    owned.push(
        building.id
    );


    game.cities[
        world.id
    ] =
        owned;


    saveGame();


    updateUI();


    renderCity();


    showToast(
        `${building.icon} ${building.name} BUILT!`
    );

}


/* =====================================================
   BUTTON EVENTS
===================================================== */

function setupEvents() {

    get("playButton")
        .addEventListener(
            "click",
            () => {

                showScreen(
                    get("gameScreen")
                );


                updateUI();


                startLevel();

            }
        );


    get("cityButton")
        .addEventListener(
            "click",
            () => {

                selectedWorldId =
                    getWorldForLevel(
                        game.level
                    ).id;


                showScreen(
                    get("cityScreen")
                );


                renderCity();

            }
        );


    get("backButton")
        .addEventListener(
            "click",
            () => {

                stopChallenge();


                showScreen(
                    get("homeScreen")
                );

            }
        );


    get("cityBackButton")
        .addEventListener(
            "click",
            () => {

                showScreen(
                    get("homeScreen")
                );

            }
        );


    get("previousWorldButton")
        .addEventListener(
            "click",
            () => {

                selectedWorldId =
                    Math.max(
                        1,
                        selectedWorldId - 1
                    );


                renderCity();

            }
        );


    get("nextWorldButton")
        .addEventListener(
            "click",
            () => {

                selectedWorldId =
                    Math.min(
                        GAME.WORLDS.length,
                        selectedWorldId + 1
                    );


                renderCity();

            }
        );

}


/* =====================================================
   START GAME
===================================================== */

function startGame() {

    loadGame();

    setupEvents();

    updateUI();

    renderCity();

}


startGame();


/* =====================================================
   SERVICE WORKER
===================================================== */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "./service-worker.js"
                )
                .catch(
                    error => {

                        console.warn(
                            "Service worker registration failed:",
                            error
                        );

                    }
                );

        }
    );

}
