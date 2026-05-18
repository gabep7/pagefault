// page replacement algorithm implementations
// each returns array of { step, page, frames, fault, evictIdx }

function simFIFO(refStr, numFrames) {
  const steps = [];
  const queue = [];
  const frames = new Array(numFrames).fill(null);

  for (let i = 0; i < refStr.length; i++) {
    const page = refStr[i];
    const idx = frames.indexOf(page);

    if (idx !== -1) {
      steps.push({ step: i, page, frames: [...frames], fault: false, evictIdx: null });
      continue;
    }

    if (queue.length < numFrames) {
      const slot = queue.length;
      queue.push(page);
      frames[slot] = page;
      steps.push({ step: i, page, frames: [...frames], fault: true, evictIdx: null });
    } else {
      const victim = queue.shift();
      const evictIdx = frames.indexOf(victim);
      queue.push(page);
      frames[evictIdx] = page;
      steps.push({ step: i, page, frames: [...frames], fault: true, evictIdx });
    }
  }
  return steps;
}

function simLRU(refStr, numFrames) {
  const steps = [];
  const frames = new Array(numFrames).fill(null);
  const lastUsed = new Map();

  for (let i = 0; i < refStr.length; i++) {
    const page = refStr[i];
    const idx = frames.indexOf(page);

    if (idx !== -1) {
      lastUsed.set(page, i);
      steps.push({ step: i, page, frames: [...frames], fault: false, evictIdx: null });
      continue;
    }

    const emptyIdx = frames.indexOf(null);
    if (emptyIdx !== -1) {
      frames[emptyIdx] = page;
      lastUsed.set(page, i);
      steps.push({ step: i, page, frames: [...frames], fault: true, evictIdx: null });
    } else {
      let lruPage = frames[0];
      let lruTime = lastUsed.get(lruPage) ?? -1;
      let evictIdx = 0;

      for (let f = 1; f < frames.length; f++) {
        const t = lastUsed.get(frames[f]) ?? -1;
        if (t < lruTime) {
          lruTime = t;
          lruPage = frames[f];
          evictIdx = f;
        }
      }

      lastUsed.delete(lruPage);
      frames[evictIdx] = page;
      lastUsed.set(page, i);
      steps.push({ step: i, page, frames: [...frames], fault: true, evictIdx });
    }
  }
  return steps;
}

function simOptimal(refStr, numFrames) {
  const steps = [];
  const frames = new Array(numFrames).fill(null);

  for (let i = 0; i < refStr.length; i++) {
    const page = refStr[i];
    const idx = frames.indexOf(page);

    if (idx !== -1) {
      steps.push({ step: i, page, frames: [...frames], fault: false, evictIdx: null });
      continue;
    }

    const emptyIdx = frames.indexOf(null);
    if (emptyIdx !== -1) {
      frames[emptyIdx] = page;
      steps.push({ step: i, page, frames: [...frames], fault: true, evictIdx: null });
    } else {
      let evictIdx = 0;
      let farthest = -1;

      for (let f = 0; f < frames.length; f++) {
        let nextUse = Infinity;
        for (let j = i + 1; j < refStr.length; j++) {
          if (refStr[j] === frames[f]) {
            nextUse = j;
            break;
          }
        }
        if (nextUse > farthest) {
          farthest = nextUse;
          evictIdx = f;
        }
      }

      frames[evictIdx] = page;
      steps.push({ step: i, page, frames: [...frames], fault: true, evictIdx });
    }
  }
  return steps;
}

function simClock(refStr, numFrames) {
  const steps = [];
  const frames = new Array(numFrames).fill(null);
  const refBits = new Array(numFrames).fill(0);
  let pointer = 0;

  for (let i = 0; i < refStr.length; i++) {
    const page = refStr[i];
    const idx = frames.indexOf(page);

    if (idx !== -1) {
      refBits[idx] = 1;
      steps.push({ step: i, page, frames: [...frames], fault: false, evictIdx: null });
      continue;
    }

    const emptyIdx = frames.indexOf(null);
    if (emptyIdx !== -1) {
      frames[emptyIdx] = page;
      refBits[emptyIdx] = 1;
      pointer = (emptyIdx + 1) % numFrames;
      steps.push({ step: i, page, frames: [...frames], fault: true, evictIdx: null });
    } else {
      let evictIdx = -1;
      while (evictIdx === -1) {
        if (refBits[pointer] === 0) {
          evictIdx = pointer;
        } else {
          refBits[pointer] = 0;
          pointer = (pointer + 1) % numFrames;
        }
      }
      frames[evictIdx] = page;
      refBits[evictIdx] = 1;
      pointer = (evictIdx + 1) % numFrames;
      steps.push({ step: i, page, frames: [...frames], fault: true, evictIdx });
    }
  }
  return steps;
}

function simulate(algorithm, refStr, numFrames) {
  switch (algorithm) {
    case 'fifo':   return simFIFO(refStr, numFrames);
    case 'lru':    return simLRU(refStr, numFrames);
    case 'optimal':return simOptimal(refStr, numFrames);
    case 'clock':  return simClock(refStr, numFrames);
    default:       return [];
  }
}
