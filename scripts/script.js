"use strict"

let squares = document.querySelector('.squares');

let width = window.innerWidth;
let height = window.innerHeight;
let AmountOfSquaresByWidth = Math.floor(width / 22);
let AmountOfSquaresByHeight = Math.floor(height / 22);
let amountOfSquares = AmountOfSquaresByWidth * AmountOfSquaresByHeight;

createSquares(squares, amountOfSquares);

for (let square of squares.children) {
    square.addEventListener('mouseenter', () => {
        square.style.background = createRGB();
    });

    square.addEventListener('mouseleave', () => {
        square.style.background = '#222222';
    })
}

function createSquares(parent, amount) {

    for (let i = 0; i < amount; i++) {
        let square = document.createElement("div");
        square.className = "square";
        square.id = i;
        square.style.background = "#222222";

        parent.appendChild(square);
    };
}

function createRGB() {
    let red = getRandomNumber(0, 255);
    let green = getRandomNumber(0, 255);
    let blue = getRandomNumber(0, 255);

    return `rgb(${red}, ${green}, ${blue})`;
};

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};