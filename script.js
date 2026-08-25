"use strict";

/* =====================================================
   CITY QUEST
   PART 4 — REAL LEVEL CHALLENGES
===================================================== */

const GAME = {

    maxLevel: 200,

    worlds: [

        {
            id: 1,
            name: "NEON CITY",
            startLevel: 1,
            endLevel: 50,
            unlockLevel: 1,
            multiplier: 1,
            buildings: [
                { id: "neon_house", name: "Neon House", icon: "🏠", price: 500 },
                { id: "neon_shop", name: "Cyber Shop", icon: "🏪", price: 1200 },
                { id: "neon_park", name: "Energy Park", icon: "🌳", price: 2000 },
                { id: "neon_tower", name: "Mega Tower", icon: "🏢", price: 5000 }
            ]
        },

        {
            id: 2,
            name: "TROPICAL CITY",
            startLevel: 51,
            endLevel: 100,
            unlockLevel: 50,
            multiplier: 1.5,
            buildings: [
                { id: "beach_house", name: "Beach House", icon: "🏖️", price: 2500 },
                { id: "resort", name: "Resort", icon: "🏝️", price: 5000 },
                { id: "water_park", name: "Water Park", icon: "🌊", price: 9000 },
                { id: "tropical_tower", name: "Sky Resort", icon: "🏨", price: 15000 }
            ]
        },

        {
            id: 3,
            name: "FROST CITY",
            startLevel: 101,
            endLevel: 150,
            unlockLevel: 100,
            multiplier: 2,
            buildings: [
                { id: "ice_home", name: "Ice Home", icon: "🏠", price: 8000 },
                { id: "winter_market", name: "Winter Market", icon: "🏪", price: 15000 },
                { id: "ice_lab", name: "Ice Lab", icon: "🔬", price: 25000 },
                { id: "crystal_tower", name: "Crystal Tower", icon: "🏙️", price: 40000 }
            ]
        },

        {
            id: 4,
            name: "SPACE CITY",
            startLevel: 151,
            endLevel: 200,
            unlockLevel: 150,
            multiplier: 3,
            buildings: [
                { id: "space_home", name: "Space Base", icon: "🛸", price: 25000 },
                { id: "rocket_factory", name: "Rocket Factory", icon: "🚀", price: 50000 },
                { id: "alien_market", name: "Alien Market", icon: "👽", price: 75000 },
                { id: "space_station", name: "Space Station", icon: "🛰️", price: 150000 }
            ]
        }

    ]

};


/* SAVE */

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

let game = {
    ...DEFAULT_SAVE,
    cities: { ...DEFAULT_SAVE.cities }
};

let selectedWorldId = 1;
let toastTimeout = null;
let currentChallenge = null;
let reactionTimer = null;
let reactionReady = false;


/* ELEMENTS */

const $ = (id) => document.getElementById(id);

const coinsElement = $("coins");
const levelElement = $("level");
const currentLevelElement = $("currentLevel");
const rewardPreview = $("rewardPreview");

const homeWorldBadge = $("homeWorldBadge");
const homeWorldName = $("homeWorldName");
const gameWorldBadge = $("gameWorldBadge");

const cityWorldBadge = $("cityWorldBadge");
const cityWorldName = $("cityWorldName");
const selectedWorldNumber = $("selectedWorldNumber");

const cityGrid = $("cityGrid");
const buildingShop = $("buildingShop");
const cityContent = $("cityContent");
const lockedWorldMessage = $("lockedWorldMessage");
const unlockRequirement = $("unlockRequirement");

const homeScreen = $("homeScreen");
const gameScreen = $("gameScreen");
const cityScreen = $("cityScreen");

const toast = $("toast");

const playButton = $("playButton");
const cityButton = $("cityButton");
const backButton = $("backButton");
const cityBackButton = $("cityBackButton");

const previousWorldButton = $("previousWorldButton");
const nextWorldButton = $("nextWorldButton");

const challengeTitle = $("challengeTitle");

const clickChallenge = $("clickChallenge");
const targetProgress = $("targetProgress");
const targetArena = $("targetArena");
const targetButton = $("targetButton");

const reactionChallenge = $("reactionChallenge");
const reactionMessage = $("reactionMessage");
const reactionButton = $("reactionButton");

const mathChallenge = $("mathChallenge");
const mathQuestion = $("mathQuestion");
const mathAnswer = $("mathAnswer");
const mathSubmitButton = $("mathSubmitButton");


/* SAVE */

function saveGame() {

    try {

        localStorage.setItem(
            "cityQuestSave",
            JSON.stringify(game)
        );

    } catch (error) {

        console.error(error);

    }

}


function loadGame() {

    try {

        const saved =
            localStorage.getItem(
                "cityQuestSave"
            );

        if (!saved) return;

        const parsed =
            JSON.parse(saved);

        game = {
            ...DEFAULT_SAVE,
            ...parsed,

            cities: {
                ...DEFAULT_SAVE.cities,
                ...parsed.cities
            }
        };

    } catch (error) {

        console.error(error);

    }

}


/* WORLDS */

function getWorldFromLevel(level) {

    return GAME.worlds.find(
        world =>
            level >= world.startLevel &&
            level <= world.endLevel
    ) || GAME.worlds[0];

}


function getWorldById(id) {

    return GAME.worlds.find(
        world => world.id === id
    );

}


function isWorldUnlocked(world) {

    return (
        game.highestLevelCompleted >=
        world.unlockLevel
    );

}


function getCurrentWorld() {

    return getWorldFromLevel(
        game.level
    );

}


/* REWARDS */

function getLevelReward(level) {

    const world =
        getWorldFromLevel(level);

    const base =
        100 + Math.floor(level * 35);

    const reward =
        Math.floor(
            base * world.multiplier
        );

    const milestone =
        level % 10 === 0
            ? reward
            : 0;

    const worldBonus =
        level % 50 === 0
            ? reward * 3
            : 0;

    const finalBonus =
        level === 200
            ? 50000
            : 0;

    return (
        reward +
        milestone +
        worldBonus +
        finalBonus
    );

}


/* UI */

function updateUI() {

    coinsElement.textContent =
        Math.floor(
            game.coins
        ).toLocaleString();

    levelElement.textContent =
        game.level;

    currentLevelElement.textContent =
        game.level;

    rewardPreview.textContent =
        `REWARD: ${getLevelReward(
            game.level
        ).toLocaleString()} 🪙`;

    const world =
        getCurrentWorld();

    const number =
        String(world.id).padStart(
            2,
            "0"
        );

    homeWorldBadge.textContent =
        `WORLD ${number}`;

    homeWorldName.textContent =
        world.name;

    gameWorldBadge.textContent =
        `WORLD ${number} — ${world.name}`;

}


/* SCREENS */

function showScreen(screen) {

    stopCurrentChallenge();

    homeScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    cityScreen.classList.add("hidden");

    screen.classList.remove("hidden");

}


/* TOAST */

function showToast(message) {

    if (toastTimeout) {

        clearTimeout(
            toastTimeout
        );

    }

    toast.textContent =
        message;

    toast.classList.add("show");

    toastTimeout =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2500);

}


/* CHALLENGE SYSTEM */

function getChallengeType(level) {

    const types = [
        "click",
        "reaction",
        "math"
    ];

    return types[
        (level - 1) % types.length
    ];

}


function hideAllChallenges() {

    clickChallenge.classList.add("hidden");
    reactionChallenge.classList.add("hidden");
    mathChallenge.classList.add("hidden");

}


function stopCurrentChallenge() {

    if (reactionTimer) {

        clearTimeout(
            reactionTimer
        );

        reactionTimer = null;

    }

    reactionReady = false;
    currentChallenge = null;

}


function startLevel() {

    stopCurrentChallenge();

    updateUI();

    hideAllChallenges();

    const type =
        getChallengeType(
            game.level
        );

    currentChallenge = type;


    if (type === "click") {

        startClickChallenge();

    }

    if (type === "reaction") {

        startReactionChallenge();

    }

    if (type === "math") {

        startMathChallenge();

    }

}


/* CLICK CHALLENGE */

function startClickChallenge() {

    clickChallenge.classList.remove(
        "hidden"
    );

    const required =
        Math.min(
            8 + Math.floor(
                game.level / 5
            ),
            25
        );

    let clicks = 0;

    challengeTitle.textContent =
        "CLICK THE TARGET!";

    targetProgress.textContent =
        `${clicks} / ${required}`;


    function moveTarget() {

        const maxX =
            Math.max(
                0,
                targetArena.clientWidth -
                targetButton.offsetWidth
            );

        const maxY =
            Math.max(
                0,
                targetArena.clientHeight -
                targetButton.offsetHeight
            );

        const x =
            Math.random() * maxX;

        const y =
            Math.random() * maxY;

        targetButton.style.left =
            `${x}px`;

        targetButton.style.top =
            `${y}px`;

    }


    targetButton.onclick =
        () => {

            if (
                currentChallenge !==
                "click"
            ) {
                return;
            }

            clicks++;

            targetProgress.textContent =
                `${clicks} / ${required}`;

            if (
                clicks >= required
            ) {

                targetButton.onclick =
                    null;

                winLevel();

                return;

            }

            moveTarget();

        };


    requestAnimationFrame(
        moveTarget
    );

}


/* REACTION CHALLENGE */

function startReactionChallenge() {

    reactionChallenge.classList.remove(
        "hidden"
    );

    challengeTitle.textContent =
        "WAIT FOR GREEN!";

    reactionReady = false;

    reactionMessage.textContent =
        "Do not click yet...";

    reactionButton.textContent =
        "WAIT";

    reactionButton.classList.remove(
        "ready"
    );


    const delay =
        1200 +
        Math.random() * 2500;


    reactionTimer =
        setTimeout(() => {

            if (
                currentChallenge !==
                "reaction"
            ) {
                return;
            }

            reactionReady = true;

            reactionMessage.textContent =
                "CLICK NOW!";

            reactionButton.textContent =
                "CLICK!";

            reactionButton.classList.add(
                "ready"
            );

        }, delay);


    reactionButton.onclick =
        () => {

            if (
                currentChallenge !==
                "reaction"
            ) {
                return;
            }

            if (!reactionReady) {

                showToast(
                    "❌ TOO EARLY!"
                );

                startLevel();

                return;

            }

            reactionButton.onclick =
                null;

            winLevel();

        };

}


/* MATH CHALLENGE */

function startMathChallenge() {

    mathChallenge.classList.remove(
        "hidden"
    );

    challengeTitle.textContent =
        "SOLVE THE CODE!";

    const difficulty =
        Math.max(
            1,
            Math.ceil(
                game.level / 25
            )
        );

    const a =
        Math.floor(
            Math.random() *
            (10 * difficulty)
        ) + 1;

    const b =
        Math.floor(
            Math.random() *
            (10 * difficulty)
        ) + 1;

    const answer =
        a + b;

    mathQuestion.textContent =
        `${a} + ${b} = ?`;

    mathAnswer.value = "";

    mathAnswer.focus();


    mathSubmitButton.onclick =
        () => {

            if (
                currentChallenge !==
                "math"
            ) {
                return;
            }

            const value =
                Number(
                    mathAnswer.value
                );

            if (
                value === answer
            ) {

                winLevel();

            } else {

                showToast(
                    "❌ WRONG ANSWER!"
                );

                mathAnswer.value = "";
                mathAnswer.focus();

            }

        };

}


/* WIN LEVEL */

function winLevel() {

    if (!currentChallenge) {

        return;

    }

    const completedLevel =
        game.level;

    const reward =
        getLevelReward(
            completedLevel
        );

    stopCurrentChallenge();

    game.coins += reward;

    game.highestLevelCompleted =
        Math.max(
            game.highestLevelCompleted,
            completedLevel
        );

    if (
        completedLevel <
        GAME.maxLevel
    ) {

        game.level++;

    }

    saveGame();

    updateUI();


    if (
        completedLevel ===
        GAME.maxLevel
    ) {

        showToast(
            "🏆 ALL 200 LEVELS COMPLETED!"
        );

        return;

    }


    if (
        completedLevel % 50 === 0
    ) {

        showToast(
            `🌍 ${getCurrentWorld().name} UNLOCKED!`
        );

    } else {

        showToast(
            `LEVEL ${completedLevel} COMPLETE! +${reward.toLocaleString()} 🪙`
        );

    }


    setTimeout(
        () => {

            if (
                !gameScreen.classList.contains(
                    "hidden"
                )
            ) {

                startLevel();

            }

        },
        800
    );

}


/* CITY */

function renderCity() {

    const world =
        getWorldById(
            selectedWorldId
        );

    if (!world) return;

    const number =
        String(world.id).padStart(
            2,
            "0"
        );

    cityWorldBadge.textContent =
        `WORLD ${number}`;

    cityWorldName.textContent =
        world.name;

    selectedWorldNumber.textContent =
        `WORLD ${world.id}`;


    const unlocked =
        isWorldUnlocked(world);


    cityContent.classList.toggle(
        "hidden",
        !unlocked
    );

    lockedWorldMessage.classList.toggle(
        "hidden",
        unlocked
    );


    if (!unlocked) {

        unlockRequirement.textContent =
            `Complete Level ${world.unlockLevel} to unlock this world.`;

        return;

    }


    const buildings =
        game.cities[world.id] || [];

    cityGrid.innerHTML = "";


    buildings.forEach(
        buildingId => {

            const building =
                world.buildings.find(
                    item =>
                        item.id ===
                        buildingId
                );

            if (!building) return;

            const element =
                document.createElement(
                    "div"
                );

            element.className =
                "city-building";

            element.innerHTML =
                `
                <div class="building-icon">
                    ${building.icon}
                </div>

                <div class="building-name">
                    ${building.name}
                </div>
                `;

            cityGrid.appendChild(
                element
            );

        }
    );


    for (
        let i = buildings.length;
        i < 12;
        i++
    ) {

        const plot =
            document.createElement(
                "div"
            );

        plot.className =
            "empty-plot";

        plot.textContent =
            "+";

        cityGrid.appendChild(
            plot
        );

    }


    renderBuildingShop(
        world
    );

}


function renderBuildingShop(world) {

    buildingShop.innerHTML = "";

    world.buildings.forEach(
        building => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "building-button";

            button.innerHTML =
                `
                <span class="shop-icon">
                    ${building.icon}
                </span>

                <span class="shop-name">
                    ${building.name}
                </span>

                <span class="shop-price">
                    🪙 ${building.price.toLocaleString()}
                </span>
                `;

            button.addEventListener(
                "click",
                () => {

                    buyBuilding(
                        world,
                        building
                    );

                }
            );

            buildingShop.appendChild(
                button
            );

        }
    );

}


function buyBuilding(
    world,
    building
) {

    if (
        game.coins <
        building.price
    ) {

        showToast(
            "❌ NOT ENOUGH COINS"
        );

        return;

    }


    if (
        game.cities[world.id].length >=
        12
    ) {

        showToast(
            "🏙️ CITY FULL!"
        );

        return;

    }


    game.coins -=
        building.price;

    game.cities[world.id].push(
        building.id
    );

    saveGame();

    updateUI();

    renderCity();

    showToast(
        `${building.icon} BUILT!`
    );

}


/* EVENTS */

playButton.addEventListener(
    "click",
    () => {

        showScreen(
            gameScreen
        );

        startLevel();

    }
);


cityButton.addEventListener(
    "click",
    () => {

        selectedWorldId =
            getCurrentWorld().id;

        showScreen(
            cityScreen
        );

        renderCity();

    }
);


backButton.addEventListener(
    "click",
    () => {

        showScreen(
            homeScreen
        );

    }
);


cityBackButton.addEventListener(
    "click",
    () => {

        showScreen(
            homeScreen
        );

    }
);


previousWorldButton.addEventListener(
    "click",
    () => {

        if (
            selectedWorldId > 1
        ) {

            selectedWorldId--;

            renderCity();

        }

    }
);


nextWorldButton.addEventListener(
    "click",
    () => {

        if (
            selectedWorldId <
            GAME.worlds.length
        ) {

            selectedWorldId++;

            renderCity();

        }

    }
);


mathAnswer.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            mathSubmitButton.click();

        }

    }
);


/* START */

loadGame();

updateUI();

saveGame();
