const N = 9;
const CLASSIC_COLLECTION = "Maeda Nobuaki · Newly Selected Tsumego 100 Problems for 1–8k";
const problems = [
  { type: "吃子", title: "最后一口气", text: "轮到黑棋。点在白棋最后一口气上，把它吃掉！", tip: "棋子上下左右相邻的空点叫作“气”。没有气的棋子会被提走。", black: [[4,3],[3,4],[5,4]], white: [[4,4]], answers: [[4,5]] },
  { type: "连接", title: "把伙伴连起来", text: "轮到黑棋。两颗黑棋快要分开了，落在哪里可以连接它们？", tip: "相邻的同色棋子是一块棋，它们共享所有的气。", black: [[3,4],[5,4]], white: [[4,3],[4,5]], answers: [[4,4]] },
  { type: "吃子", title: "角上的白棋", text: "轮到黑棋。角上的白棋只剩一口气，找出来！", tip: "棋盘边和角会减少棋子的气，所以角上的棋更容易被吃。", black: [[1,0],[0,1],[2,1]], white: [[1,1]], answers: [[1,2]] },
  { type: "断点", title: "切断白棋", text: "轮到黑棋。白棋想连成一块，先占住它们之间的断点。", tip: "两颗棋之间的空点常常是连接点，也可能是对手的断点。", black: [[3,3],[5,5]], white: [[3,4],[5,4]], answers: [[4,4]] },
  { type: "做眼", title: "留住眼位", text: "轮到黑棋。中间这个空点很重要，先落子保护自己的眼位。", tip: "两只真正的眼能让一块棋无法被对方全部吃掉。", black: [[3,4],[4,3],[5,4]], white: [[3,5],[5,5]], answers: [[4,4]] },
  { type: "吃子", title: "双子一口气", text: "轮到黑棋。两颗白棋是一块，它们最后的气在哪里？", tip: "不论一块棋有几颗，只要最后一口气被填上，整块都会被提走。", black: [[3,3],[3,4],[4,2],[5,3],[5,4]], white: [[4,3],[4,4]], answers: [[4,5]] },
  { type: "先手", title: "先补断点", text: "轮到黑棋。白棋下一手会把黑棋切开，黑棋该先补哪里？", tip: "对方能切断的地方，往往是自己需要先补的断点。", black: [[2,4],[4,4]], white: [[3,3],[3,5]], answers: [[3,4]] },
  { type: "综合", title: "最后的考验", text: "轮到黑棋。白棋中间的一块只剩一口气，稳稳地吃掉它！", tip: "做题时先数气：看看每一块棋有几口气，再决定落子。", black: [[3,4],[4,3],[5,4],[3,5],[5,5]], white: [[4,4]], answers: [[4,5]] },
  { type: "吃子", title: "边上的最后一气", text: "轮到黑棋。白棋贴着边，最后一口气在哪里？", tip: "边上的棋少了棋盘外侧的一口气，要特别留意。", black: [[2,4],[3,3],[4,4]], white: [[3,4]], answers: [[3,5]] },
  { type: "吃子", title: "角的力量", text: "轮到黑棋。角上的白棋已被包住，落下最后一子。", tip: "角上的棋最多只有两口初始气，是最容易被吃的位置。", black: [[0,2],[1,1]], white: [[0,1]], answers: [[1,0]] },
  { type: "连接", title: "横向连接", text: "轮到黑棋。黑棋左右两边呼应，连接点是哪一个？", tip: "连接能让两块棋合成一块，气也会更多。", black: [[2,6],[4,6]], white: [[3,5],[3,7]], answers: [[3,6]] },
  { type: "连接", title: "竖向连接", text: "轮到黑棋。上下两颗黑棋需要马上牵手。", tip: "连接时先看对手会不会在中间落子切断。", black: [[6,2],[6,4]], white: [[5,3],[7,3]], answers: [[6,3]] },
  { type: "断点", title: "占住要点", text: "轮到黑棋。白棋两子想连接，黑棋要抢占中间的要点。", tip: "一个空点常常既是自己的连接点，也是对手的断点。", black: [[3,2],[5,2]], white: [[4,1],[4,3]], answers: [[4,2]] },
  { type: "吃子", title: "三子一口气", text: "轮到黑棋。白棋三子是一整块，找它唯一的气。", tip: "数气要数“棋块”的气，而不是一颗一颗地数。", black: [[2,3],[2,4],[2,5],[3,2],[4,2],[5,3],[5,4],[5,5],[3,6],[4,6]], white: [[3,3],[4,3],[4,4]], answers: [[3,4]] },
  { type: "打吃", title: "先打吃", text: "轮到黑棋。把白棋逼到只剩一口气，这一手叫“打吃”。", tip: "打吃不一定立刻提子，但会要求对手回应。", black: [[2,2],[3,1]], white: [[3,2]], answers: [[4,2]] },
  { type: "逃跑", title: "给黑棋出路", text: "轮到黑棋。黑棋只剩一口气，快帮它逃出来。", tip: "自己的棋被打吃时，先补气或连接到有气的伙伴。", black: [[5,6]], white: [[4,6],[5,5],[6,6]], answers: [[5,7]] },
  { type: "逃跑", title: "沿边长气", text: "轮到黑棋。边上的黑棋危险了，往哪里长一口气？", tip: "逃跑时尽量往空旷处走，不要钻进对手的包围圈。", black: [[1,6]], white: [[0,6],[1,5],[2,6]], answers: [[1,7]] },
  { type: "连接", title: "连回大本营", text: "轮到黑棋。中间的小黑棋要连回左边的伙伴。", tip: "连接到大棋块后，通常就不怕被单独吃掉了。", black: [[2,2],[4,2]], white: [[3,1],[3,3]], answers: [[3,2]] },
  { type: "断点", title: "不要让它连上", text: "轮到黑棋。白棋上下呼应，落在断点上把它们分开。", tip: "切断后，对手的两块棋就要分别照顾。", black: [[6,3],[6,5]], white: [[5,4],[7,4]], answers: [[6,4]] },
  { type: "做眼", title: "眼的中心", text: "轮到黑棋。围好的空地要保住，落在中心做眼。", tip: "眼是被自己棋子围住、对方不能安全落子的空点。", black: [[3,3],[4,2],[5,3],[3,4],[5,4],[3,5],[4,6],[5,5]], white: [], answers: [[4,4]] },
  { type: "做眼", title: "第二只眼", text: "轮到黑棋。这一块已有一只眼，再做一只眼才更安全。", tip: "一块棋有两只真眼，通常就能活下来。", black: [[1,2],[2,1],[3,2],[1,3],[3,3],[1,4],[2,5],[3,4],[5,3],[6,2],[7,3],[5,4],[7,4],[6,5]], white: [], answers: [[2,3],[6,3]] },
  { type: "死活", title: "堵住眼位", text: "轮到黑棋。白棋想在中间做眼，抢先占住它。", tip: "死活题里，眼位通常是双方最重要的争夺点。", black: [[3,3],[5,3],[3,5],[5,5]], white: [[4,2],[2,4],[6,4],[4,6]], answers: [[4,4]] },
  { type: "吃子", title: "包围四子", text: "轮到黑棋。白棋四子被围住，只剩下中间一口气。", tip: "一口气很宝贵；找到它，常常就找到了解题的第一手。", black: [[2,3],[2,4],[2,5],[3,2],[4,2],[5,3],[5,4],[5,5],[3,6],[4,6]], white: [[3,3],[4,3],[3,4],[4,4]], answers: [[3,5],[4,5]] },
  { type: "征子", title: "追赶的方向", text: "轮到黑棋。白棋被打吃后会逃，先从正确方向继续追。", tip: "征子像锯齿一样追赶；先确认路上有没有对方的接应。", black: [[2,2],[3,1],[4,2]], white: [[3,2]], answers: [[3,3]] },
  { type: "先手", title: "先手补棋", text: "轮到黑棋。这里有断点，先补上就不会被白棋切开。", tip: "先手是对手必须回应的棋；能先手补强就很舒服。", black: [[3,6],[5,6]], white: [[4,5],[4,7]], answers: [[4,6]] },
  { type: "吃子", title: "边上双子", text: "轮到黑棋。白棋两子靠边，找最后一口气。", tip: "边上棋块的气比中腹少，数起来会更快。", black: [[1,2],[2,1],[3,2],[1,3],[3,3],[1,4],[2,5],[3,4]], white: [[2,2],[2,3]], answers: [[2,4]] },
  { type: "连接", title: "虎口连接", text: "轮到黑棋。黑棋斜着相望，落在虎口里把它们连稳。", tip: "虎口是两颗棋斜对形成的弯曲连接形状。", black: [[3,3],[4,4]], white: [[2,3],[3,2],[5,4],[4,5]], answers: [[3,4],[4,3]] },
  { type: "断点", title: "扳住缺口", text: "轮到黑棋。白棋想从缺口穿过，黑棋应该在哪儿拦住？", tip: "对局中看到对方两块棋靠近，就要寻找可以切断的缺口。", black: [[2,4],[4,4]], white: [[3,3],[3,5]], answers: [[3,4]] },
  { type: "做眼", title: "角上做眼", text: "轮到黑棋。角部的小空地是眼位，先把它守住。", tip: "角上的一只眼很小，但配合另一只眼就能让棋活。", black: [[0,2],[1,1],[2,0],[2,1],[1,2]], white: [[2,2]], answers: [[0,1],[1,0]] },
  { type: "死活", title: "破眼", text: "轮到黑棋。白棋的眼形还没完成，抢占关键点破眼。", tip: "破掉对方的一只眼，才可能把对方整块棋吃掉。", black: [[2,2],[6,2],[2,6],[6,6]], white: [[3,3],[4,3],[5,3],[3,4],[5,4],[3,5],[4,5],[5,5]], answers: [[4,4]] },
  { type: "打劫", title: "劫争要点", text: "轮到黑棋。这里是劫的争夺点，先把关键一手落下。", tip: "打劫后不能马上在原处提回，要先在别处下一手。", black: [[3,3],[4,2],[5,3],[3,4]], white: [[4,3],[5,4],[4,5]], answers: [[4,4]] },
  { type: "打劫", title: "劫材优先", text: "轮到黑棋。劫争前先在对方薄弱处制造威胁。", tip: "能让对手必须回答的威胁，叫作劫材。", black: [[1,4],[2,3],[3,4]], white: [[2,4]], answers: [[2,5]] },
  { type: "手筋", title: "靠的手筋", text: "轮到黑棋。贴近白棋落子，利用对方的薄弱气。", tip: "手筋是局部最巧妙、最有效的一手棋。", black: [[3,3],[5,5]], white: [[4,3],[4,4],[5,4]], answers: [[3,4]] },
  { type: "手筋", title: "挖的手筋", text: "轮到黑棋。白棋连接得不牢，往中间一挖。", tip: "“挖”常用来破坏对方的连接，但要先看自己有没有气。", black: [[3,5],[5,5]], white: [[4,4],[4,6]], answers: [[4,5]] },
  { type: "攻防", title: "先保护弱棋", text: "轮到黑棋。左边黑棋很薄，先补一手让它更安全。", tip: "下棋时先找双方最弱的棋，攻防就更有方向。", black: [[2,4],[3,3]], white: [[1,4],[2,5],[3,4]], answers: [[4,3]] },
  { type: "攻防", title: "限制白棋", text: "轮到黑棋。白棋正要向右逃跑，在哪儿可以限制它？", tip: "攻击不一定要吃掉对方，先限制对方的发展也很重要。", black: [[3,4],[4,3]], white: [[4,4]], answers: [[5,4]] },
  { type: "综合", title: "三步前的第一手", text: "轮到黑棋。先吃掉白棋的要害一子，再考虑后续。", tip: "难题也从数气开始：先找到最紧急的棋块。", black: [[3,2],[2,3],[4,3]], white: [[3,3]], answers: [[3,4]] },
  { type: "综合", title: "闯关毕业题", text: "轮到黑棋。白棋中央一块只剩最后一口气，稳稳地吃掉它！", tip: "恭喜！先观察棋块、再数气、最后确认自己的棋也安全。", black: [[3,4],[4,3],[5,4],[3,5],[5,5]], white: [[4,4]], answers: [[4,5]] }
];

let current = Number(localStorage.getItem("go-kids-level") || 0);
let solved = new Set(JSON.parse(localStorage.getItem("go-kids-solved") || "[]"));
current = Math.min(Math.max(current, 0), problems.length - 1);
let passed = false;

const el = id => document.getElementById(id);
const board = el("board"), message = el("message"), next = el("next-button");
const key = ([x,y]) => `${x},${y}`;
const sourceNote = el("source-note");

function render() {
  const p = problems[current]; passed = false; next.disabled = true;
  el("level-tag").textContent = `第 ${current + 1} 关 · ${p.type}`;
  el("problem-title").textContent = p.title;
  el("problem-text").textContent = p.text;
  el("tip-text").textContent = p.tip;
  sourceNote.textContent = p.source || "题目：自编入门练习";
  el("progress-label").textContent = `第 ${current + 1} / ${problems.length} 关`;
  el("stars").textContent = `⭐ ${solved.size}`;
  el("progress-bar").style.width = `${Math.max(12.5, (solved.size / problems.length) * 100)}%`;
  message.className = "message"; message.textContent = "请选择一个交叉点落子。";
  board.innerHTML = "";
  const size = p.size || N;
  board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  board.classList.toggle("large-board", size > N);
  const blacks = new Set(p.black.map(key)), whites = new Set(p.white.map(key));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
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
    passed = true; cell.classList.remove("choice"); cell.classList.add(problems[current].answerColor || "black", "correct");
    solved.add(current); localStorage.setItem("go-kids-solved", JSON.stringify([...solved]));
    localStorage.setItem("go-kids-level", String(current));
    message.className = "message success"; message.textContent = current === problems.length - 1 ? `太棒了！你完成了全部 ${problems.length} 关！` : "答对啦！这一关通过。";
    next.disabled = false; el("stars").textContent = `⭐ ${solved.size}`;
    el("progress-bar").style.width = `${(solved.size / problems.length) * 100}%`;
  } else { message.className = "message error"; message.textContent = "再想一想：先数一数每一块棋还有几口气。"; }
}
el("hint-button").addEventListener("click", () => { const a = problems[current].answers[0]; message.className = "message"; message.textContent = `提示：试试第 ${a[0] + 1} 列、第 ${a[1] + 1} 行的交叉点。`; });
next.addEventListener("click", () => { current = (current + 1) % problems.length; localStorage.setItem("go-kids-level", String(current)); render(); });
el("reset-progress").addEventListener("click", () => { if (confirm("确定重新开始吗？闯关星星会清零。")) { solved = new Set(); current = 0; localStorage.removeItem("go-kids-solved"); localStorage.setItem("go-kids-level", "0"); render(); } });
render();

function sourcePoint(point) {
  return [point.charCodeAt(0) - 97, point.charCodeAt(1) - 97];
}

function adaptClassicProblem(data) {
  const solutions = (data.s || []).filter(line => line[1] && /^[a-s]{2}$/.test(line[1]));
  const answers = [...new Set(solutions.map(line => line[1]))].map(sourcePoint);
  if (!answers.length) return null;
  const turn = solutions[0][0] === "W" ? "white" : "black";
  return {
    type: data.l === "advanced" ? "经典死活 · 高级" : "经典死活 · 中级",
    title: `${data.c || CLASSIC_COLLECTION} · ${String(data.n).padStart(3, "0")}`,
    text: `${turn === "black" ? "黑棋" : "白棋"}先走。请找出这道经典死活题的第一手。`,
    tip: "先不要急着落子：数气、找眼位、判断对方最强的抵抗。",
    black: (data.b || []).map(sourcePoint),
    white: (data.w || []).map(sourcePoint),
    answers,
    answerColor: turn,
    size: 19,
    source: `内置经典题库：${data.c || CLASSIC_COLLECTION}（题 ${String(data.n).padStart(3, "0")}；来源 sanderland/tsumego，MIT License）`
  };
}

function installClassicCollection() {
  const classics = (window.CLASSIC_PROBLEMS || []).map(adaptClassicProblem).filter(Boolean);
  if (classics.length !== 600) {
    sourceNote.textContent = "内置题库文件不完整，请刷新页面。";
    return;
  }
  problems.push(...classics);
  current = Math.min(current, problems.length - 1);
  render();
}

installClassicCollection();
