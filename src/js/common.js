('use strict');

const squares = document.querySelector('.squares');
let monitorWidth = window.innerWidth;
let monitorHeight = window.innerHeight;
let squareSize = calculateSquareSize(monitorWidth, monitorHeight);
const RESIZE_DEBOUNCE_DELAY = 200;

function calculateSquareSize(monitorWidth, monitorHeight) {
	let squareSize = 20;
	while (squareSize > 0 && squareSize <= 50) {
		if (
			monitorWidth % squareSize === 0 &&
			monitorHeight % squareSize === 0 &&
			Math.floor(width / squareSize) === Math.floor(height / squareSize)
		) {
			return squareSize;
		}
		squareSize++;
	}

	return 20;
}

function calculateSquareAmount(monitorWidth, monitorHeight, squareSize) {
	const amountByWidth = Math.floor(monitorWidth / squareSize);
	const amountByHeight = Math.floor(monitorHeight / squareSize);
	return amountByWidth * amountByHeight;
}

function createSquares(parent, amount) {
	const fragment = document.createDocumentFragment();

	for (let i = 0; i < amount; i++) {
		const square = document.createElement('div');
		square.className = 'square';
		square.style.width = `${squareSize}px`;
		square.style.height = `${squareSize}px`;
		fragment.appendChild(square);
	}

	parent.appendChild(fragment);
}

function setupSquareEvents() {
	squares.addEventListener('mouseover', event => {
		if (event.target.classList.contains('square')) {
			event.target.style.setProperty('--bg-color', createRGB());
		}
	});

	squares.addEventListener('mouseout', event => {
		if (event.target.classList.contains('square')) {
			event.target.style.setProperty('--bg-color', '#222222');
		}
	});
}

let amountOfSquares = calculateSquareAmount(
	monitorWidth,
	monitorHeight,
	squareSize
);
createSquares(squares, amountOfSquares);
setupSquareEvents();

window.addEventListener(
	'resize',
	debounce(() => {
		monitorWidth = window.innerWidth;
		monitorHeight = window.innerHeight;
		squareSize = calculateSquareSize(monitorWidth, monitorHeight);
		const newAmountOfSquares = calculateSquareAmount(
			monitorWidth,
			monitorHeight,
			squareSize
		);

		if (newAmountOfSquares !== amountOfSquares) {
			amountOfSquares = newAmountOfSquares;
			squares.innerHTML = '';
			createSquares(squares, amountOfSquares);
			setupSquareEvents();
		}
	}, RESIZE_DEBOUNCE_DELAY)
);

function createRGB() {
	const red = getRandomNumber(0, 255);
	const green = getRandomNumber(0, 255);
	const blue = getRandomNumber(0, 255);
	return `rgb(${red}, ${green}, ${blue})`;
}

function getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function debounce(func, wait) {
	let timeout;
	return function (...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(this, args), wait);
	};
}
