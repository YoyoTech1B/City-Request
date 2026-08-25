"use strict";

/* =====================================================
   CITY QUEST
   PART 3 — CITY BUILDING SYSTEM
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
            unlockLevel: 1,
            multiplier: 1,

            buildings: [
                {
                    id: "neon_house",
                    name: "Neon House",
                    icon: "🏠",
                    price: 500
                },
                {
                    id: "neon_shop",
                    name: "Cyber Shop",
                    icon: "🏪",
                    price: 1200
                },
                {
                    id: "neon_park",
                    name: "Energy Park",
                    icon: "🌳",
                    price: 2000
                },
                {
                    id: "neon_tower",
                    name: "Mega Tower",
                    icon: "🏢",
                    price: 5000
                }
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
                {
                    id: "beach_house",
                    name: "Beach House",
                    icon: "🏖️",
                    price: 2500
                },
                {
                    id: "resort",
                    name: "Resort",
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
                    id: "tropical_tower",
                    name: "Sky Resort",
                    icon: "🏨",
                    price: 15000
                }
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
            startLevel: 151,
            endLevel: 200,
            unlockLevel: 150,
            multiplier: 3,

            buildings: [
                {
                    id: "space_home",
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
   SAVE DATA
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


let game = {

    ...DEFAULT_SAVE,

    cities: {

        ...DEFAULT_SAVE.cities

    }

};


let selectedWorldId = 1;

let toastTimeout = null;


/* =====================================================
   HTML ELEMENTS
===================================================== */

const coinsElement =
    document.getElementById("coins");

const levelElement =
    document.getElementById("level");

const currentLevelElement =
    document.getElementById("currentLevel");

const rewardPreview =
    document.getElementById("rewardPreview");

const homeWorldBadge =
    document.getElementById("homeWorldBadge");

const homeWorldName =
    document.getElementById("homeWorldName");

const gameWorldBadge =
    document.getElementById("gameWorldBadge");

const cityWorldBadge =
    document.getElementById("cityWorldBadge");

const cityWorldName =
    document.getElementById("cityWorldName");

const selectedWorldNumber =
    document.getElementById("selectedWorldNumber");

const cityGrid =
    document.getElementById("cityGrid");

const buildingShop =
    document.getElementById("buildingShop");

const cityContent =
    document.getElementById("cityContent");

const lockedWorldMessage =
    document.getElementById("lockedWorldMessage");

const unlockRequirement =
    document.getElementById("unlockRequirement");

const homeScreen =
    document.getElementById("homeScreen");

const gameScreen =
    document.getElementById("gameScreen");

const cityScreen =
    document.getElementById("cityScreen");

const toast =
    document.getElementById("toast");

const playButton =
    document.getElementById("playButton");

const cityButton =
    document.getElementById("cityButton");

const backButton =
    document.getElementById("backButton");

const cityBackButton =
    document.getElementById("cityBackButton");

const completeButton =
    document.getElementById("completeButton");

const previousWorldButton =
    document.getElementById("previousWorldButton");

const nextWorldButton =
    document.getElementById("nextWorldButton");


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
            "Save failed:",
            error
        );

    }

}


function loadGame() {

    try {

        const savedGame =
            localStorage.getItem(
                "cityQuestSave"
            );

        if (!savedGame) {

            return;

        }

        const parsedSave =
            JSON.parse(savedGame);

        game = {

            ...DEFAULT_SAVE,

            ...parsedSave,

            cities: {

                ...DEFAULT_SAVE.cities,

                ...parsedSave.cities

            }

        };

    } catch (error) {

        console.error(
            "Load failed:",
            error
        );

        game = {

            ...DEFAULT_SAVE,

            cities: {

                ...DEFAULT_SAVE.cities

            }

        };

    }

}


/* =====================================================
   WORLD HELPERS
===================================================== */

function getWorldFromLevel(level) {

    return GAME.worlds.find(
        (world) =>
            level >= world.startLevel &&
            level <= world.endLevel
    ) || GAME.worlds[0];

}


function getWorldById(id) {

    return GAME.worlds.find(
        (world) =>
            world.id === id
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


/* =====================================================
   COIN REWARDS
===================================================== */

function getLevelReward(level) {

    const world =
        getWorldFromLevel(level);

    const baseReward =
        100 +
        Math.floor(level * 35);

    const reward =
        Math.floor(
            baseReward *
            world.multiplier
        );

    const milestoneBonus =
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
        milestoneBonus +
        worldBonus +
        finalBonus
    );

}


/* =====================================================
   UI
===================================================== */

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

    updateWorldUI();

}


function updateWorldUI() {

    const world =
        getCurrentWorld();

    const worldNumber =
        String(world.id).padStart(
            2,
            "0"
        );

    homeWorldBadge.textContent =
        `WORLD ${worldNumber}`;

    homeWorldName.textContent =
        world.name;

    gameWorldBadge.textContent =
        `WORLD ${worldNumber} — ${world.name}`;

}


/* =====================================================
   CITY
===================================================== */

function renderCity() {

    const world =
        getWorldById(
            selectedWorldId
        );

    if (!world) {

        return;

    }

    const worldNumber =
        String(world.id).padStart(
            2,
            "0"
        );

    cityWorldBadge.textContent =
        `WORLD ${worldNumber}`;

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
            `Complete Level ${world.unlockLevel} to unlock ${world.name}.`;

        return;

    }


    const buildings =
        game.cities[world.id] || [];


    cityGrid.innerHTML = "";


    buildings.forEach(
        (buildingId) => {

            const building =
                world.buildings.find(
                    (item) =>
                        item.id ===
                        buildingId
                );

            if (!building) {

                return;

            }

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

        const emptyPlot =
            document.createElement(
                "div"
            );

        emptyPlot.className =
            "empty-plot";

        emptyPlot.textContent =
            "+";

        cityGrid.appendChild(
            emptyPlot
        );

    }


    renderBuildingShop(
        world
    );

}


function renderBuildingShop(world) {

    buildingShop.innerHTML = "";


    world.buildings.forEach(
        (building) => {

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

    if (!isWorldUnlocked(world)) {

        showToast(
            "🔒 WORLD LOCKED"
        );

        return;

    }


    if (
        game.coins <
        building.price
    ) {

        showToast(
            "❌ NOT ENOUGH COINS"
        );

        return;

    }


    const city =
        game.cities[world.id];


    if (city.length >= 12) {

        showToast(
            "🏙️ CITY FULL!"
        );

        return;

    }


    game.coins -=
        building.price;


    city.push(
        building.id
    );


    saveGame();

    updateUI();

    renderCity();


    showToast(
        `${building.icon} ${building.name} BUILT!`
    );

}


/* =====================================================
   LEVEL COMPLETION
===================================================== */

function completeCurrentLevel() {

    if (
        game.highestLevelCompleted >=
        GAME.maxLevel
    ) {

        showToast(
            "🏆 YOU COMPLETED ALL 200 LEVELS!"
        );

        return;

    }


    const completedLevel =
        game.level;

    const reward =
        getLevelReward(
            completedLevel
        );


    game.coins += reward;


    game.highestLevelCompleted =
        completedLevel;


    if (
        completedLevel <
        GAME.maxLevel
    ) {

        game.level++;

    }


    saveGame();

    updateUI();


    if (
        completedLevel % 50 === 0 &&
        completedLevel <
        GAME.maxLevel
    ) {

        const newWorld =
            getCurrentWorld();

        showToast(
            `🌍 ${newWorld.name} UNLOCKED!`
        );

        return;

    }


    if (
        completedLevel ===
        GAME.maxLevel
    ) {

        showToast(
            `🏆 ALL 200 LEVELS COMPLETE! +${reward.toLocaleString()} 🪙`
        );

        return;

    }


    showToast(
        `LEVEL ${completedLevel} COMPLETE! +${reward.toLocaleString()} 🪙`
    );

}


/* =====================================================
   SCREENS
===================================================== */

function showScreen(screen) {

    homeScreen.classList.add(
        "hidden"
    );

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
   TOAST
===================================================== */

function showToast(message) {

    if (toastTimeout) {

        clearTimeout(
            toastTimeout
        );

    }

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =====================================================
   EVENTS
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


completeButton.addEventListener(
    "click",
    completeCurrentLevel
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


/* =====================================================
   START
===================================================== */

loadGame();

updateUI();

saveGame();
