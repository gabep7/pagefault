// rendering — builds frame table and updates stats

const viz = {
  currentStep: 0,
  steps: [],
  numFrames: 0,

  init(numFrames) {
    this.numFrames = numFrames;
    this.currentStep = 0;
    this.steps = [];

    const table = document.getElementById('frame-table');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    thead.innerHTML = '';
    const headerRow = document.createElement('tr');
    const stepTh = document.createElement('th');
    stepTh.textContent = 'step';
    headerRow.appendChild(stepTh);

    const refTh = document.createElement('th');
    refTh.textContent = 'ref';
    headerRow.appendChild(refTh);

    for (let i = 0; i < numFrames; i++) {
      const th = document.createElement('th');
      th.textContent = 'frame ' + i;
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);

    tbody.innerHTML = '';
    this.tbody = tbody;
  },

  load(steps) {
    this.steps = steps;
    this.currentStep = 0;
    this.tbody.innerHTML = '';
    document.getElementById('step-counter').textContent = 'step 0 / ' + steps.length;
    document.getElementById('fault-counter').textContent = 'faults: 0';
    document.getElementById('hit-counter').textContent = 'hits: 0';
  },

  renderStep(stepIndex) {
    if (stepIndex >= this.steps.length) return;

    const s = this.steps[stepIndex];
    const row = document.createElement('tr');

    const stepCell = document.createElement('td');
    stepCell.textContent = s.step;
    row.appendChild(stepCell);

    const refCell = document.createElement('td');
    refCell.textContent = s.page;
    refCell.className = s.fault ? 'fault' : 'hit';
    row.appendChild(refCell);

    for (let f = 0; f < this.numFrames; f++) {
      const td = document.createElement('td');
      const val = s.frames[f];
      if (val === null) {
        td.textContent = '\u00b7';
        td.className = 'empty';
      } else if (f === s.evictIdx) {
        td.textContent = val;
        td.className = 'evict';
      } else if (s.fault && val === s.page && f !== s.evictIdx) {
        td.textContent = val;
        td.className = 'fault';
      } else {
        td.textContent = val;
      }
      row.appendChild(td);
    }

    this.tbody.appendChild(row);

    const slice = this.steps.slice(0, stepIndex + 1);
    const faults = slice.filter(function(st) { return st.fault; }).length;
    const hits = stepIndex + 1 - faults;
    document.getElementById('step-counter').textContent =
      'step ' + (stepIndex + 1) + ' / ' + this.steps.length;
    document.getElementById('fault-counter').textContent = 'faults: ' + faults;
    document.getElementById('hit-counter').textContent = 'hits: ' + hits;

    this.currentStep = stepIndex + 1;
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  renderAll() {
    this.tbody.innerHTML = '';
    let faults = 0;
    let hits = 0;

    for (const s of this.steps) {
      const row = document.createElement('tr');

      const stepCell = document.createElement('td');
      stepCell.textContent = s.step;
      row.appendChild(stepCell);

      const refCell = document.createElement('td');
      refCell.textContent = s.page;
      refCell.className = s.fault ? 'fault' : 'hit';
      row.appendChild(refCell);

      for (let f = 0; f < this.numFrames; f++) {
        const td = document.createElement('td');
        const val = s.frames[f];
        if (val === null) {
          td.textContent = '\u00b7';
          td.className = 'empty';
        } else if (f === s.evictIdx) {
          td.textContent = val;
          td.className = 'evict';
        } else if (s.fault && val === s.page && f !== s.evictIdx) {
          td.textContent = val;
          td.className = 'fault';
        } else {
          td.textContent = val;
        }
        row.appendChild(td);
      }

      this.tbody.appendChild(row);

      if (s.fault) faults++;
      else hits++;
    }

    document.getElementById('step-counter').textContent =
      'step ' + this.steps.length + ' / ' + this.steps.length;
    document.getElementById('fault-counter').textContent = 'faults: ' + faults;
    document.getElementById('hit-counter').textContent = 'hits: ' + hits;
    this.currentStep = this.steps.length;
  },

  isComplete() {
    return this.currentStep >= this.steps.length;
  }
};
