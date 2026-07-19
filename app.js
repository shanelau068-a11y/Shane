const N = 9;
const problems = [
  { type: "吃子", title: "最后一口气", text: "轮到黑棋。点在白棋最后一口气上，把它吃掉！", tip: "棋子上下左右相邻的空点叫作“气”。没有气的棋子会被提走。", black: [[4,3],[3,4],[5,4]], white: [[4,4]], answers: [[4,5]] },
  { type: "连接", title: "把伙伴连起来", text: "轮到黑棋。两颗黑棋快要分开了，落在哪里可以连接它们？", tip: "相邻的同色棋子是一块棋，它们共享所有的气。", black: [[3,4],[5,4]], white: [[4,3],[4,5]], answers: [[4,4]] },
  { type: "吃子", title: "角上的白棋", text: "轮到黑棋。角上的白棋只剩一口气，找出来！", tip: "棋盘边和角会减少棋子的气，所以角上的棋更容易被吃。", black: [[1,0],[0,1],[2,1]], white: [[1,1]], answers: [[1,2]] },
  { type: "断点", title: "切断白棋", text: "轮到黑棋。白棋想连成一块，先占住它们之间的断点。", tip: "两颗棋之间的空点常常是连接点，也可能是对手的断点。", black: [[3,3],[5,5]], white: [[3,4],[5,4]], answers: [[4,4]] },
  { type: "做眼", title: "留住眼位", text: "轮到黑棋。中间这个空点很重要，先落子保护自己的眼位。", tip: "两只真正的眼能让一块棋无法被对方全部吃掉。", black: [[3,4],[4,3],[5,4]], white: [[3,5],[5,5]], answers: [[4,4]] },
  { type: "吃子", title: "双子一口气", text: "轮到黑棋。两颗白棋是一块，它们最后的气在哪里？", tip: "不论一块棋有几颗，只要最后一口气被填上，整块都会被提走。", black: [[3,3],[3,4],[4,2],[5,3],[5,4]], white: [[4,3],[4,4]], answers: [[4,5]] },
  { type: "先手", title: "先补断点", text: "轮到黑棋。白棋下一手会把黑棋切开，黑棋该先补哪里？", tip: "对方能切断的地方，往往是自己需要先补的断点。", black: [[2,4],[4,4]], white: [[3,3],[3,5]], answers: [[3,4]] },
  { type: "综合", title: "最后的考验", text: "轮到黑棋。白棋中间的一块只剩一口气，稳稳地吃掉它！", tip: "做题时先数气：看看每一块棋有几口气，再决定落子。", black: [[3,4],[4,3],[5,4],[3,5],[5,5]], white: [[4,4]], answers: [[4,5]] }
];

let current = Number(localStorage.getItem("go-kids-level") || 0);
let solved = new Set(JSON.parse(localStorage.getItem("go-kids-solved") || "[]"));
current = Math.min(Math.max(current, 0), problems.length - 1);
let passed = false;

const el = id => document.getElementById(id);
const board = el("board"), message = el("message"), next = el("next-button");
const key = ([x,y]) => `${x},${y}`;

function render() {
  const p = problems[current]; passed = false; next.disabled = true;
  el("level-tag").textContent = `第 ${current + 1} 关 · ${p.type}`;
  el("problem-title").textContent = p.title;
  el("problem-text").textContent = p.text;
  el("tip-text").textContent = p.tip;
  el("progress-label").textContent = `第 ${current + 1} / ${problems.length} 关`;
  el("stars").textContent = `⭐ ${solved.size}`;
  el("progress-bar").style.width = `${Math.max(12.5, (solved.size / problems.length) * 100)}%`;
  message.className = "message"; message.textContent = "请选择一个交叉点落子。";
  board.innerHTML = "";
  const blacks = new Set(p.black.map(key)), whites = new Set(p.white.map(key));
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const cell = document.createElement("button"); cell.type = "button"; cell.className = "point";
    const pos = [x,y];
    if (blacks.has(key(pos))) cell.classList.add("black");
    else if (whites.has(key(pos))) cell.classList.add("white");
    else { cell.classList.add("choice"); cell.setAttribute("aria-label", `第 ${x + 1} 列，第 ${y + 1} 行落子`); cell.addEventListener("click", () => choose(pos, cell)); }
    board.append(cell);
  }
}
function choose(pos, cell) {
  if (passed) return;
  const correct = problems[current].answers.some(a => key(a) === key(pos));
  if (correct) {
    passed = true; cell.classList.remove("choice"); cell.classList.add("black", "correct");
    solved.add(current); localStorage.setItem("go-kids-solved", JSON.stringify([...solved]));
    localStorage.setItem("go-kids-level", String(current));
    message.className = "message success"; message.textContent = current === problems.length - 1 ? "太棒了！你完成了全部 8 关！" : "答对啦！这一关通过。";
    next.disabled = false; el("stars").textContent = `⭐ ${solved.size}`;
    el("progress-bar").style.width = `${(solved.size / problems.length) * 100}%`;
  } else { message.className = "message error"; message.textContent = "再想一想：先数一数每一块棋还有几口气。"; }
}
el("hint-button").addEventListener("click", () => { const a = problems[current].answers[0]; message.className = "message"; message.textContent = `提示：试试第 ${a[0] + 1} 列、第 ${a[1] + 1} 行的交叉点。`; });
next.addEventListener("click", () => { current = (current + 1) % problems.length; localStorage.setItem("go-kids-level", String(current)); render(); });
el("reset-progress").addEventListener("click", () => { if (confirm("确定重新开始吗？闯关星星会清零。")) { solved = new Set(); current = 0; localStorage.removeItem("go-kids-solved"); localStorage.setItem("go-kids-level", "0"); render(); } });
render();
