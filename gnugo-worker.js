let engineInitialized = false;
let readyResolve;
const engineReady = new Promise(resolve => { readyResolve = resolve; });

self.Module = {
  print() {},
  printErr() {},
  onRuntimeInitialized() { readyResolve(self.Module); }
};

importScripts("gnugo-engine.js");

self.onmessage = async event => {
  const { id, size, komi, moves } = event.data;
  try {
    const engine = await engineReady;
    if (moves.some(move => move.pass)) {
      self.postMessage({ id, move: null });
      return;
    }
    if (engineInitialized) engine._finalizeGoGame();
    engine._initializeGoGame(size, Math.round(komi), 0, Date.now() & 0x7fffffff);
    engineInitialized = true;
    for (const move of moves) {
      if (engine._moveTo(move.y, move.x) !== 0) throw new Error("历史棋局无法同步");
    }
    engine._genNextStep();
    let generated = { pass: true };
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (engine._isLastMove(y, x)) generated = { x, y };
      }
    }
    self.postMessage({ id, move: generated });
  } catch (error) {
    self.postMessage({ id, error: error?.message || String(error) });
  }
};
