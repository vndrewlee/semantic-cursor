const modelURL =
  "https://cdn.glitch.com/670bd0c3-4761-4b40-8adc-a36dee36c3cb%2Fwordvecs5000.json?v=1575425512135";
const dreamsForm = document.forms[0];
const dreamInput = dreamsForm.elements["word"];
const wordboard = document.getElementById("wordboard");
const cursorEl = document.getElementById("cursor");
const targetEl = document.getElementById("target");
var cursorValue;
var targetValue;
var nearValues = [];

var socket = io();

socket.on('connection', () => console.log('connected'));

io.on('connection', socket => {
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
});

var word2Vec = ml5.word2vec(modelURL, onLoad);

function onLoad() {
  setTarget();
  setCursor();
}

function setTarget() {
  word2Vec.getRandomWord().then(word => {
    targetValue = word;
    targetEl.textContent = "Target: " + targetValue;
  });
}

function setCursor() {
  word2Vec.getRandomWord().then(word => {
    cursorValue = word;
    cursorEl.textContent = cursorValue;
  });
}

// nearButton.mousePressed(() => {
//   let word = nearWordInput.value();
//   word2Vec.nearest(word, (err, result) => {
//     let output = "";
//     if (result) {
//       for (let i = 0; i < result.length; i++) {
//         output += result[i].word + "<br/>";
//       }
//     } else {
//       output = "No word vector found";
//     }
//     nearResults.html(output);
//   });
// });

// listen for the form to be submitted and add a new dream when it is
dreamsForm.onsubmit = function(event) {
  // stop our form submission from refreshing the page
  event.preventDefault();

  cursor.textContent = dreamInput.value;

  // reset form
  dreamInput.value = "";
  dreamInput.focus();
};

// wb = document.getElementById("wordboard")
// wb.rows[0].cells[0].textContent = 'eyyyy'
