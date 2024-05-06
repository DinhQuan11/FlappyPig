const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// board
let board = $("#board");
let container = $(".container");
let rect = board.getBoundingClientRect();
let boardWidth = rect.width;
let boardHeight = rect.height;
let context;

// bird
let birdWidth = 48; // width/height ratio
let birdHeight = 36;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight,
};

// pipe
let pipeArray = [];
let pipeWidth = 64; // width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// physics
let velocityX = -2; // pipe moving left speed
let velocityY = 0; // bird jump speed
let gravity = 0.3;

let gamePlay = false;
let gameOver = false;
let score = 0;

// sounds
let pointSound = $(".point-sound");
let dieSound = $(".die-sound");

window.onload = () => {
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d"); //used for drawing on the board

  //draw flappy bird
  // context.fillStyle = "green";
  // context.fillRect(bird.x, bird.y, bird.width, bird.height);

  // load image
  birdImg = new Image();
  birdImg.src = "../../../FlappyPig/assets/images/pig.png";
  birdImg.onload = () => {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  };

  topPipeImg = new Image();
  topPipeImg.src = "../../../FlappyPig/assets/images/toppipe.png";

  bottomPipeImg = new Image();
  bottomPipeImg.src = "../../../FlappyPig/assets/images/bottompipe.png";

  requestAnimationFrame(update);
  setInterval(placePipes, 1000);
  document.addEventListener("keydown", moveBird);
};

function updateHighScore(score) {
  let highScore = localStorage.getItem("highScore");

  if (!highScore || score > parseInt(highScore)) {
    localStorage.setItem("highScore", score);
  }
}

function getHighScore() {
  let highScore = localStorage.getItem("highScore");

  if (!highScore) {
    return 0;
  }

  return parseInt(highScore);
}

function updateScoreDisplay() {
  var gameScore = $(".game-score");
  if (!gameScore) {
    gameScore = document.createElement("h1");
    gameScore.classList.add("game-score");
    container.appendChild(gameScore);
  }
  gameScore.textContent = `Score: ${score}`;

  let highScore = getHighScore();
  var highScoreDisplay = $(".high-score");
  if (!highScoreDisplay) {
    highScoreDisplay = document.createElement("h1");
    highScoreDisplay.classList.add("high-score");
    container.appendChild(highScoreDisplay);
  }
  highScoreDisplay.textContent = `High Score: ${highScore}`;
}

function update() {
  requestAnimationFrame(update);
  if (!gamePlay) {
    return;
  } else {
    var gameStartText = $(".game-start");
    gameStartText.textContent = "";
  }

  if (gameOver) {
    return;
  }
  context.clearRect(0, 0, board.width, board.height);

  // bird
  velocityY += gravity;
  bird.y += velocityY;
  bird.y = Math.max(bird.y, velocityY, 0); // limit the bird.y to top of canvas
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  if (bird.y > board.height) {
    gameOver = true;
  }

  // pipe
  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      pointSound.play();
      score += 0.5; // because there are 2 pipe
      pipe.passed = true;
    }

    if (detectCollision(bird, pipe)) {
      gameOver = true;
      updateHighScore(score);
    }
  }

  // clear pipe
  while (pipeArray.length > 0 && pipeArray[0].x < 0 - pipeWidth) {
    pipeArray.shift(); // remove first element from the array
  }

  updateScoreDisplay();

  if (gameOver) {
    dieSound.play();

    var gameOverText = document.createElement("h1");
    gameOverText.classList.add("game-over");
    gameOverText.textContent = "Game Over!";
    container.appendChild(gameOverText);
  }
}

function placePipes() {
  if (!gamePlay) {
    return;
  }
  if (gameOver) {
    return;
  }
  // (0-1) * pipeHeight/2
  // 0 -> -128 (pipeHeight/4)
  // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  let openingSpace = board.height / 4;

  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };

  pipeArray.push(topPipe);

  let bottomPipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(bottomPipe);
}

function moveBird(e) {
  if (e.code == "Space" || e.code == "ArrowUp") {
    gamePlay = true;
    // jump
    velocityY = -6;

    // restart
    if (gameOver) {
      bird.y = birdY;
      pipeArray = [];
      score = 0;
      gameOver = false;
      container.removeChild($(".game-over"));
    }
  }
}

function detectCollision(bird, pipe) {
  return (
    bird.x < pipe.x + pipe.width &&
    bird.x + bird.width > pipe.x &&
    bird.y < pipe.y + pipe.height &&
    bird.y + bird.height > pipe.y
  );
}
