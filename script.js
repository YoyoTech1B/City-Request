"use strict";

/* =====================================================
   CITY QUEST
   PART 2 — 200 LEVEL PROGRESSION
===================================================== */


/* =====================================================
   GAME DATA
===================================================== */

const GAME = {
    maxLevel: 200,

    worlds: [
        {
            id: 1,
            name: "NEON CITY",
            startLevel: 1,
            endLevel: 50,
            multiplier: 1
        },
        {
            id: 2,
            name: "TROPICAL CITY",
            startLevel: 51,
            endLevel: 100,
            multiplier: 1.5
        },
        {
            id: 3,
            name: "FROST CITY",
            startLevel: 101,
            endLevel: 150,
            multiplier: 2
        },
        {
            id: 4,
            name: "SPACE CITY",
            startLevel: 151,
            endLevel: 200,
            multiplier: 3
        }
    ]
};


/* =====================================================
   DEFAULT SAVE DATA
===================================================== */

const DEFAULT_SAVE = {
    coins: 0,
    level: 1,
    highestLevelCompleted: 0
};


/* =====================================================
   GAME STATE
===================================================== */

let game = {
    ...DEFAULT_SAVE
};


/* =====================================================
   HTML ELEMENTS
===================================================== */

const coinsElement =
    document.getElementById("coins");

const levelElement =
    document.getElementById("level");

const currentLevelElement =
    document.getElementById("currentLevel");

const playButton =
    document.getElementById("playButton");

const cityButton =
    document.getElementById("cityButton");

const gameScreen =
    document.getElementById("gameScreen");

const cityScreen =
    document.getElementById("cityScreen");

const backButton =
    document.getElementById("backButton");

const cityBackButton =
    document.getElementById("cityBackButton");

const completeButton =
    document.getElementById("completeButton");

const toast =
    document.getElementById("toast");


/* =====================================================
   SAVE SYSTEM
===================================================== */

function saveGame() {

    try {

        localStorage.setItem(
            "cityQuestSave",
            JSON.stringify(game)
        );

    } catch (error) {

        console.error(
            "Could not save game:",
            error
        );

    }

}


function loadGame() {

    try {

        const savedGame =
            localStorage.getItem("cityQuestSave");

        if (!savedGame) {
            return;
        }

        const parsedSave =
            JSON.parse(savedGame);

        game = {
            ...DEFAULT_SAVE,
            ...parsedSave
        };

        validateGameData();

    } catch (error) {

        console.error(
            "Could not load save:",
            error
        );

        game = {
            ...DEFAULT_SAVE
        };

    }

}


/* =====================================================
   DATA VALIDATION
===================================================== */

function validateGameData() {

    if (
        typeof game.coins !== "number" ||
        !Number.isFinite(game.coins) ||
        game.coins < 0
    ) {
        game.coins = 0;
    }


    if (
        typeof game.level !== "number" ||
        !Number.isInteger(game.level)
    ) {
        game.level = 1;
    }


    game.level = Math.max(
        1,
        Math.min(
            GAME.maxLevel,
            game.level
        )
    );


    if (
        typeof game.highestLevelCompleted !== "number" ||
        !Number.isInteger(
            game.highestLevelCompleted
        )
    ) {
        game.highestLevelCompleted = 0;
    }


    game.highestLevelCompleted =
        Math.max(
            0,
            Math.min(
                GAME.maxLevel,
                game.highestLevelCompleted
            )
        );

}


/* =====================================================
   WORLD SYSTEM
===================================================== */

function getWorldFromLevel(level) {

    for (const world of GAME.worlds) {

        if (
            level >= world.startLevel &&
            level <= world.endLevel
        ) {
            return world;
        }

    }

    return GAME.worlds[0];

}


function getCurrentWorld() {

    return getWorldFromLevel(
        game.level
    );

}


/* =====================================================
   COIN REWARD SYSTEM
===================================================== */

function getLevelReward(level) {

    const world =
        getWorldFromLevel(level);


    const baseReward =
        100 +
        Math.floor(level * 35);


    const worldReward =
        Math.floor(
            baseReward *
            world.multiplier
        );


    const milestoneBonus =
        level % 10 === 0
            ? worldReward
            : 0;


    const worldCompletionBonus =
        level % 50 === 0
            ? worldReward * 3
            : 0;


    const finalBonus =
        level === GAME.maxLevel
            ? 50000
            : 0;


    return (
        worldReward +
        milestoneBonus +
        worldCompletionBonus +
        finalBonus
    );

}


/* =====================================================
   UI UPDATE
===================================================== */

function updateUI() {

    validateGameData();


    coinsElement.textContent =
        Math.floor(
            game.coins
        ).toLocaleString();


    levelElement.textContent =
        game.level;


    currentLevelElement.textContent =
        game.level;


    updateWorldUI();

}


function updateWorldUI() {

    const world =
        getCurrentWorld();


    const worldBadges =
        document.querySelectorAll(
            ".world-badge"
        );


    worldBadges.forEach((badge) => {

        if (
            !badge.textContent.includes(
                "LEVEL"
            )
        ) {
            badge.textContent =
                `WORLD ${String(
                    world.id
                ).padStart(2, "0")} — ${world.name}`;
        }

    });

}


/* =====================================================
   SCREEN SYSTEM
===================================================== */

function showScreen(screen) {

    gameScreen.classList.add(
        "hidden"
    );

    cityScreen.classList.add(
        "hidden"
    );


    screen.classList.remove(
        "hidden"
    );

}


/* =====================================================
   TOAST SYSTEM
===================================================== */

let toastTimeout = null;


function showToast(message) {

    if (toastTimeout) {

        window.clearTimeout(
            toastTimeout
        );

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    toastTimeout =
        window.setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2600);

}


/* =====================================================
   LEVEL COMPLETION
===================================================== */

function completeCurrentLevel() {

    if (
        game.level >=
        GAME.maxLevel
    ) {

        if (
            game.highestLevelCompleted >=
            GAME.maxLevel
        ) {

            showToast(
                "🏆 ALL 200 LEVELS COMPLETED!"
            );

            return;

        }

    }


    const completedLevel =
        game.level;


    const reward =
        getLevelReward(
            completedLevel
        );


    game.coins +=
        reward;


    game.highestLevelCompleted =
        Math.max(
            game.highestLevelCompleted,
            completedLevel
        );


    const worldCompleted =
        completedLevel % 50 === 0;


    if (
        completedLevel <
        GAME.maxLevel
    ) {

        game.level =
            completedLevel + 1;

    }


    saveGame();

    updateUI();


    if (
        completedLevel ===
        GAME.maxLevel
    ) {

        showToast(
            `🏆 FINAL LEVEL COMPLETE! +${reward.toLocaleString()} COINS!`
        );

        return;

    }


    if (worldCompleted) {

        const newWorld =
            getCurrentWorld();


        showToast(
            `🌍 WORLD UNLOCKED! ${newWorld.name}`
        );

        return;

    }


    showToast(
        `LEVEL ${completedLevel} COMPLETE! +${reward.toLocaleString()} 🪙`
    );

}


/* =====================================================
   BUTTON EVENTS
===================================================== */

playButton.addEventListener(
    "click",
    () => {

        showScreen(
            gameScreen
        );

        updateUI();

    }
);


cityButton.addEventListener(
    "click",
    () => {

        showScreen(
            cityScreen
        );

        updateUI();

    }
);


backButton.addEventListener(
    "click",
    () => {

        gameScreen.classList.add(
            "hidden"
        );

    }
);


cityBackButton.addEventListener(
    "click",
    () => {

        cityScreen.classList.add(
            "hidden"
        );

    }
);


completeButton.addEventListener(
    "click",
    completeCurrentLevel
);


/* =====================================================
   START GAME
===================================================== */

loadGame();

updateUI();

saveGame();
