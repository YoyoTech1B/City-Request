"use strict";

/* =====================================================
   CITY QUEST
   PART 1 — FOUNDATION
===================================================== */

const game = {
    coins: 0,
    level: 1
};

const coinsElement = document.getElementById("coins");
const levelElement = document.getElementById("level");

const playButton = document.getElementById("playButton");
const cityButton = document.getElementById("cityButton");

const gameScreen = document.getElementById("gameScreen");
const cityScreen = document.getElementById("cityScreen");

const backButton = document.getElementById("backButton");
const cityBackButton = document.getElementById("cityBackButton");

const completeButton = document.getElementById("completeButton");

const currentLevelElement =
    document.getElementById("currentLevel");

const toast = document.getElementById("toast");


function updateUI() {

    coinsElement.textContent =
        game.coins.toLocaleString();

    levelElement.textContent =
        game.level;

    currentLevelElement.textContent =
        game.level;
}


function showScreen(screen) {

    gameScreen.classList.add("hidden");
    cityScreen.classList.add("hidden");

    screen.classList.remove("hidden");
}


function showToast(message) {

    toast.textContent = message;
    toast.classList.add("show");

    window.setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}


playButton.addEventListener("click", () => {

    showScreen(gameScreen);

    updateUI();

});


cityButton.addEventListener("click", () => {

    showScreen(cityScreen);

});


backButton.addEventListener("click", () => {

    gameScreen.classList.add("hidden");

});


cityBackButton.addEventListener("click", () => {

    cityScreen.classList.add("hidden");

});


completeButton.addEventListener("click", () => {

    const reward = game.level * 50;

    game.coins += reward;

    showToast(
        `LEVEL COMPLETE! +${reward.toLocaleString()} 🪙`
    );

    if (game.level < 200) {
        game.level++;
    }

    updateUI();

});


updateUI();
