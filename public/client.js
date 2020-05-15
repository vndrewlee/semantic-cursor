const modelURLsm =
  "https://cdn.glitch.com/670bd0c3-4761-4b40-8adc-a36dee36c3cb%2Fwordvecs1000.json?v=1575419642687";

const textForm = document.forms[0];
const textInput = textForm.elements["word"];
const history = document.getElementById("history");
const cursorEl = document.getElementById("cursor");
const targetEl = document.getElementById("target");
const targetContext = document.getElementById("targetContext");

var state = {};
var nearValues = [];
var prevDistance;

var socket = io();
socket.on("state", data => checkState(data));
var word2Vec = ml5.word2vec(modelURLsm, onLoad);

function onLoad() {
  fetch("/state")
    .then(res => res.json())
    .then(data => checkState(data));
}

function checkState(data) {
  // if missing cursor or target, send new one to server
  if (!data.cursor) {
    word2Vec.getRandomWord().then(word => socket.emit("newCursor", word));
  }

  if (!data.target) {
    word2Vec.getRandomWord().then(word => socket.emit("newTarget", word));
  }

  // update state object

  state.target = data.target;
  state.history = data.history;
  let targetTensor = word2Vec.model[state.target];

  // set first prevDistance from target
  if (!state.cursor && data.cursor && state.target) {
    let newCursorTensor = word2Vec.model[data.cursor];

    prevDistance = newCursorTensor
      .sub(targetTensor)
      .norm()
      .dataSync();
  }

  // calculate if moving closer or further
  if (state.cursor && data.cursor) {
    let oldCursor = word2Vec.model[state.cursor];
    let newCursor = word2Vec.model[data.cursor];

    let newMag = newCursor
      .sub(targetTensor)
      .norm()
      .dataSync();

    if (newMag > prevDistance) {
      flashCold();
    } else if (newMag < prevDistance) {
      flashHot();
    }
    prevDistance = newMag;
  }

  state.cursor = data.cursor;

  // render
  renderCursor(state.cursor);
  renderTarget(state.target);
  history.innerHTML = state.history.join(" ");
}

function renderCursor(data) {
  cursorEl.textContent = data;

  word2Vec.nearest(data).then(results => {
    nearValues = results.map(obj => obj.word);

    [...document.getElementsByClassName("nearbyWord")].forEach(
      (element, index) => {
        element.innerHTML = nearValues[index];

        if (state.history.includes(nearValues[index])) {
          element.style.color = "#551A8B";
        } else {
          element.style.color = "#0000EE";
        }
      }
    );
  });
}

function renderTarget(data) {
  targetEl.textContent = 'target word: "' + data + '"';

  word2Vec.nearest(data).then(results => {
    let nearTargets = results.map(obj => obj.word);

    targetContext.innerHTML =
      'As in: "' + nearTargets.slice(0, 5).join('", "') + '"';
  });
}

textForm.onsubmit = event => {
  event.preventDefault();

  if (nearValues.includes(textInput.value)) {
    socket.emit("newCursor", textInput.value);

    if (state.target === textInput.value) {
      flashFun();
    }

    textInput.value = "";
    textInput.focus();
  }
};

function flashFun() {
  document.body.classList = ["blink"];
  setTimeout(() => (document.body.classList = []), 2000);
}
function flashHot() {
  document.body.classList = ["hot"];
  setTimeout(() => (document.body.classList = []), 2000);
}
function flashCold() {
  document.body.classList = ["cold"];
  setTimeout(() => (document.body.classList = []), 2000);
}
