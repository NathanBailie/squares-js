"use strict"

let width = window.innerWidth;
let height = window.innerHeight;
let AmountOfSquaresByWidth = Math.floor(width / 22);
let AmountOfSquaresByHeight = Math.floor(height / 22);
let amountOfSquares = AmountOfSquaresByWidth * AmountOfSquaresByHeight;

createSquares(amountOfSquares);

function createSquares(amount) {
    let squares = document.querySelector('.squares');

    for (let i = 0; i < amount; i++) {
        let square = document.createElement("div");
        square.className = "square";
        square.id = i;
        square.style.background = "#222222";

        squares.appendChild(square);
    };
}


function createRGB() {
    let red = getRandom(0, 255);
    let green = getRandom(0, 255);
    let blue = getRandom(0, 255);

    return `rgb(${red}, ${green}, ${blue})`;
};

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};