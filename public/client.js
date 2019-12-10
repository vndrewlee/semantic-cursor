const modelURL =
  "https://cdn.glitch.com/670bd0c3-4761-4b40-8adc-a36dee36c3cb%2Fwordvecs5000.json?v=1575425512135";
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

var socket = io();

socket.on("state", data => checkState(data));
var word2Vec = ml5.word2vec(modelURLsm, onLoad);

function onLoad() {
  fetch("/state")
    .then(res => res.json())
    .then(data => checkState(data));
}

function checkState(data) {
  if (!data.cursor) {
    word2Vec.getRandomWord().then(word => socket.emit("newCursor", word));
  }

  if (!data.target) {
    word2Vec.getRandomWord().then(word => socket.emit("newTarget", word));
  }

  history.innerHTML = data.history.join(" ");

  state = data;

  renderCursor(state.cursor);
  renderTarget(state.target);
}

function renderCursor(data) {
  cursorEl.textContent = data;

  word2Vec.nearest(data).then(results => {
    nearValues = results.map(obj => obj.word);
    console.log(nearValues);
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
      document.body.classList = ['blink'];
      setTimeout(() => document.body.classList = [], 2000);
    }
    
    textInput.value = "";
    textInput.focus();
  }
  
  
  
};
