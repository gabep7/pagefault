// entry point — wires controls to simulation

let runTimer = null;

function parseRefString(raw) {
  return raw.trim().split(/\s+/).map(Number).filter(function(n) { return !isNaN(n); });
}

function reset() {
  if (runTimer) {
    clearInterval(runTimer);
    runTimer = null;
  }

  const refStr = parseRefString(document.getElementById('refstring').value);
  const numFrames = parseInt(document.getElementById('frames').value, 10);
  const algo = document.getElementById('algo').value;

  if (refStr.length === 0 || numFrames < 1) return;

  const steps = simulate(algo, refStr, numFrames);
  viz.init(numFrames);
  viz.load(steps);
}

function step() {
  if (viz.isComplete()) return;
  viz.renderStep(viz.currentStep);
}

function run() {
  if (viz.isComplete()) reset();

  if (runTimer) {
    clearInterval(runTimer);
    runTimer = null;
    return;
  }

  const speed = parseInt(document.getElementById('speed').value, 10);
  runTimer = setInterval(function() {
    if (viz.isComplete()) {
      clearInterval(runTimer);
      runTimer = null;
      return;
    }
    viz.renderStep(viz.currentStep);
  }, speed);
}

document.getElementById('step-btn').addEventListener('click', step);
document.getElementById('run-btn').addEventListener('click', run);
document.getElementById('reset-btn').addEventListener('click', reset);

document.getElementById('speed').addEventListener('input', function(e) {
  document.getElementById('speed-val').textContent = e.target.value;
});

document.getElementById('refstring').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') reset();
});

document.getElementById('frames').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') reset();
});

document.getElementById('algo').addEventListener('change', reset);

reset();
