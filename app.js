const steps = [
  "画一个大长方形，做消防车的车身。",
  "在车头画一个小方形，做驾驶室。",
  "在车顶画一条长梯子（两条平行线）。",
  "画两个大圆做车轮，再在圆里画小圆。",
  "画上车灯、窗户和门把手。",
  "最后涂色：车身红色，梯子灰色，车灯黄色。"
];

const stepsElement = document.getElementById("steps");
const prevBtn = document.getElementById("prevStep");
const nextBtn = document.getElementById("nextStep");
let activeStepIndex = 0;

function renderSteps() {
  stepsElement.innerHTML = "";
  steps.forEach((text, idx) => {
    const li = document.createElement("li");
    li.textContent = `第 ${idx + 1} 步：${text}`;
    if (idx === activeStepIndex) li.classList.add("active");
    stepsElement.appendChild(li);
  });
}

prevBtn.addEventListener("click", () => {
  activeStepIndex = Math.max(0, activeStepIndex - 1);
  renderSteps();
});

nextBtn.addEventListener("click", () => {
  activeStepIndex = Math.min(steps.length - 1, activeStepIndex + 1);
  renderSteps();
});

const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const sizePicker = document.getElementById("sizePicker");
const undoBtn = document.getElementById("undoBtn");
const clearBtn = document.getElementById("clearBtn");
const guideBtn = document.getElementById("toggleGuide");
const galleryInput = document.getElementById("galleryInput");
const galleryGrid = document.getElementById("galleryGrid");
const clearGalleryBtn = document.getElementById("clearGalleryBtn");

let isDrawing = false;
let showGuide = true;
let history = [];
let lastX = 0;
let lastY = 0;

function saveState() {
  history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  if (history.length > 40) history.shift();
}

function drawGuideLayer() {
  if (!showGuide) return;
  ctx.save();
  ctx.strokeStyle = "rgba(100, 116, 139, 0.35)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);

  ctx.strokeRect(180, 240, 440, 130);
  ctx.strokeRect(560, 190, 130, 180);

  ctx.beginPath();
  ctx.moveTo(220, 220);
  ctx.lineTo(560, 220);
  ctx.lineTo(560, 245);
  ctx.lineTo(220, 245);
  ctx.closePath();
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(280, 390, 45, 0, Math.PI * 2);
  ctx.arc(560, 390, 45, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.font = "22px sans-serif";
  ctx.fillText("阿彦专属练习轮廓", 30, 40);
  ctx.restore();
}

function redraw(imageData = null) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (imageData) ctx.putImageData(imageData, 0, 0);
  drawGuideLayer();
}

function getPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const source = event.touches ? event.touches[0] : event;
  return {
    x: ((source.clientX - rect.left) * canvas.width) / rect.width,
    y: ((source.clientY - rect.top) * canvas.height) / rect.height
  };
}

function startDraw(event) {
  event.preventDefault();
  const point = getPoint(event);
  isDrawing = true;
  [lastX, lastY] = [point.x, point.y];
  saveState();
}

function drawing(event) {
  if (!isDrawing) return;
  event.preventDefault();
  const point = getPoint(event);

  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = Number(sizePicker.value);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(point.x, point.y);
  ctx.stroke();

  [lastX, lastY] = [point.x, point.y];
}

function stopDraw() {
  isDrawing = false;
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mouseleave", stopDraw);

canvas.addEventListener("touchstart", startDraw, { passive: false });
canvas.addEventListener("touchmove", drawing, { passive: false });
canvas.addEventListener("touchend", stopDraw);

undoBtn.addEventListener("click", () => {
  if (history.length === 0) return;
  const previous = history.pop();
  redraw(previous);
});

clearBtn.addEventListener("click", () => {
  saveState();
  redraw();
});

guideBtn.addEventListener("click", () => {
  showGuide = !showGuide;
  const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  redraw(snapshot);
});

renderSteps();
redraw();

const GALLERY_STORAGE_KEY = "ayan-art-gallery-v1";

function createArtCard(item, index) {
  const article = document.createElement("article");
  article.className = "art-card";

  const img = document.createElement("img");
  img.alt = `阿彦作品 ${index + 1}`;
  img.src = item.dataUrl;

  const caption = document.createElement("p");
  caption.textContent = item.caption;

  article.appendChild(img);
  article.appendChild(caption);
  return article;
}

function renderGallery(items) {
  galleryGrid.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("p");
    empty.textContent = "还没有上传作品，快把阿彦的画加进来吧！";
    galleryGrid.appendChild(empty);
    return;
  }

  items.forEach((item, idx) => {
    galleryGrid.appendChild(createArtCard(item, idx));
  });
}

function loadGallery() {
  try {
    const raw = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGallery(items) {
  localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(items));
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

galleryInput.addEventListener("change", async event => {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  const oldItems = loadGallery();
  const newItems = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const dataUrl = await fileToDataUrl(file);
    newItems.push({
      dataUrl,
      caption: `阿彦作品 · ${new Date().toLocaleDateString("zh-CN")}`
    });
  }

  const merged = [...newItems, ...oldItems].slice(0, 20);
  saveGallery(merged);
  renderGallery(merged);
  galleryInput.value = "";
});

clearGalleryBtn.addEventListener("click", () => {
  saveGallery([]);
  renderGallery([]);
});

renderGallery(loadGallery());
