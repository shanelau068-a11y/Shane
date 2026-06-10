const canvas = document.querySelector('#editorCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

const els = {
  cabinetInput: document.querySelector('#cabinetInput'),
  handleInput: document.querySelector('#handleInput'),
  rotation: document.querySelector('#rotation'),
  rotationValue: document.querySelector('#rotationValue'),
  scale: document.querySelector('#scale'),
  scaleValue: document.querySelector('#scaleValue'),
  removeBg: document.querySelector('#removeBg'),
  fillOldHandle: document.querySelector('#fillOldHandle'),
  exportSize: document.querySelector('#exportSize'),
  downloadBtn: document.querySelector('#downloadBtn'),
  resetBtn: document.querySelector('#resetBtn'),
  fitBtn: document.querySelector('#fitBtn'),
  statusText: document.querySelector('#statusText'),
};

const state = {
  cabinet: null,
  handle: null,
  processedHandle: null,
  imageFrame: { x: 0, y: 0, w: canvas.width, h: canvas.height },
  handleBox: null,
  drag: null,
};

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });
}

function resetHandleBox() {
  const frame = state.imageFrame;
  const w = frame.w * 0.11;
  const h = frame.h * 0.18;
  state.handleBox = {
    x: frame.x + frame.w * 0.64,
    y: frame.y + frame.h * 0.43,
    w,
    h,
  };
}

function fitCabinetToCanvas() {
  if (!state.cabinet) return;
  const targetRatio = 3 / 4;
  const imageRatio = state.cabinet.width / state.cabinet.height;
  let drawW = canvas.width;
  let drawH = canvas.height;

  if (imageRatio > targetRatio) {
    drawW = canvas.width;
    drawH = drawW / imageRatio;
  } else {
    drawH = canvas.height;
    drawW = drawH * imageRatio;
  }

  state.imageFrame = {
    x: (canvas.width - drawW) / 2,
    y: (canvas.height - drawH) / 2,
    w: drawW,
    h: drawH,
  };

  if (!state.handleBox) resetHandleBox();
}

function preprocessHandle() {
  if (!state.handle) {
    state.processedHandle = null;
    return;
  }

  const off = document.createElement('canvas');
  off.width = state.handle.width;
  off.height = state.handle.height;
  const offCtx = off.getContext('2d', { willReadFrequently: true });
  offCtx.drawImage(state.handle, 0, 0);

  if (els.removeBg.checked) {
    const imageData = offCtx.getImageData(0, 0, off.width, off.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
      if (brightness > 224 && maxDiff < 34) {
        data[i + 3] = Math.max(0, 255 - (brightness - 224) * 8);
      }
    }
    offCtx.putImageData(imageData, 0, 0);
  }

  state.processedHandle = off;
}

function drawCabinet(targetCtx = ctx, targetCanvas = canvas, includeGuides = true) {
  targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  targetCtx.fillStyle = '#ffffff';
  targetCtx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);

  if (!state.cabinet) {
    targetCtx.fillStyle = '#8b5a35';
    targetCtx.textAlign = 'center';
    targetCtx.font = '700 28px sans-serif';
    targetCtx.fillText('上传柜子样板图开始制作', targetCanvas.width / 2, targetCanvas.height / 2);
    return;
  }

  const frame = scaleRect(state.imageFrame, targetCanvas.width / canvas.width, targetCanvas.height / canvas.height);
  targetCtx.drawImage(state.cabinet, frame.x, frame.y, frame.w, frame.h);

  if (els.fillOldHandle.checked && state.handleBox) {
    coverOldHandle(targetCtx, targetCanvas);
  }

  drawReplacementHandle(targetCtx, targetCanvas);

  if (includeGuides && state.handleBox) {
    drawGuides(targetCtx);
  }
}

function scaleRect(rect, scaleX, scaleY) {
  return {
    x: rect.x * scaleX,
    y: rect.y * scaleY,
    w: rect.w * scaleX,
    h: rect.h * scaleY,
  };
}

function coverOldHandle(targetCtx, targetCanvas) {
  const scaleX = targetCanvas.width / canvas.width;
  const scaleY = targetCanvas.height / canvas.height;
  const box = scaleRect(expandRect(state.handleBox, 0.22), scaleX, scaleY);
  const source = scaleRect(expandRect(state.handleBox, 0.9), scaleX, scaleY);

  targetCtx.save();
  targetCtx.beginPath();
  roundedRect(targetCtx, box.x, box.y, box.w, box.h, Math.min(box.w, box.h) * 0.18);
  targetCtx.clip();
  targetCtx.filter = `blur(${Math.max(8, targetCanvas.width / 120)}px)`;
  targetCtx.drawImage(
    targetCanvas,
    source.x,
    source.y,
    source.w,
    source.h,
    box.x,
    box.y,
    box.w,
    box.h,
  );
  targetCtx.filter = 'none';
  targetCtx.globalAlpha = 0.12;
  targetCtx.fillStyle = '#f7f1ea';
  targetCtx.fillRect(box.x, box.y, box.w, box.h);
  targetCtx.restore();
}

function drawReplacementHandle(targetCtx, targetCanvas) {
  const handle = state.processedHandle;
  if (!handle || !state.handleBox) return;

  const scaleX = targetCanvas.width / canvas.width;
  const scaleY = targetCanvas.height / canvas.height;
  const box = scaleRect(state.handleBox, scaleX, scaleY);
  const userScale = Number(els.scale.value) / 100;
  const angle = (Number(els.rotation.value) * Math.PI) / 180;
  const handleRatio = handle.width / handle.height;
  const boxRatio = box.w / box.h;
  let drawW = box.w * userScale;
  let drawH = box.h * userScale;

  if (handleRatio > boxRatio) {
    drawH = drawW / handleRatio;
  } else {
    drawW = drawH * handleRatio;
  }

  targetCtx.save();
  targetCtx.translate(box.x + box.w / 2, box.y + box.h / 2);
  targetCtx.rotate(angle);
  targetCtx.shadowColor = 'rgba(0, 0, 0, 0.28)';
  targetCtx.shadowBlur = Math.max(10, targetCanvas.width / 130);
  targetCtx.shadowOffsetY = Math.max(5, targetCanvas.width / 260);
  targetCtx.drawImage(handle, -drawW / 2, -drawH / 2, drawW, drawH);
  targetCtx.restore();
}

function drawGuides(targetCtx) {
  const box = state.handleBox;
  targetCtx.save();
  targetCtx.strokeStyle = '#2f80ed';
  targetCtx.lineWidth = 2;
  targetCtx.setLineDash([8, 6]);
  targetCtx.beginPath();
  roundedRect(targetCtx, box.x, box.y, box.w, box.h, 10);
  targetCtx.stroke();
  targetCtx.setLineDash([]);

  getHandles(box).forEach((point) => {
    targetCtx.beginPath();
    targetCtx.arc(point.x, point.y, 8, 0, Math.PI * 2);
    targetCtx.fillStyle = '#ffffff';
    targetCtx.fill();
    targetCtx.strokeStyle = '#2f80ed';
    targetCtx.lineWidth = 3;
    targetCtx.stroke();
  });
  targetCtx.restore();
}

function roundedRect(targetCtx, x, y, w, h, radius) {
  const r = Math.min(radius, Math.abs(w) / 2, Math.abs(h) / 2);
  targetCtx.moveTo(x + r, y);
  targetCtx.arcTo(x + w, y, x + w, y + h, r);
  targetCtx.arcTo(x + w, y + h, x, y + h, r);
  targetCtx.arcTo(x, y + h, x, y, r);
  targetCtx.arcTo(x, y, x + w, y, r);
}

function expandRect(rect, amount) {
  return {
    x: rect.x - rect.w * amount,
    y: rect.y - rect.h * amount,
    w: rect.w * (1 + amount * 2),
    h: rect.h * (1 + amount * 2),
  };
}

function getHandles(box) {
  return [
    { name: 'nw', x: box.x, y: box.y },
    { name: 'ne', x: box.x + box.w, y: box.y },
    { name: 'sw', x: box.x, y: box.y + box.h },
    { name: 'se', x: box.x + box.w, y: box.y + box.h },
  ];
}

function pointerToCanvas(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function hitTest(point) {
  if (!state.handleBox) return null;
  const corner = getHandles(state.handleBox).find((handle) => Math.hypot(point.x - handle.x, point.y - handle.y) < 16);
  if (corner) return { type: 'corner', corner: corner.name };

  const box = state.handleBox;
  if (point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h) {
    return { type: 'move' };
  }
  return null;
}

function updateBoxFromDrag(point) {
  if (!state.drag) return;
  const box = state.handleBox;
  const minSize = 24;

  if (state.drag.hit.type === 'move') {
    box.x = point.x - state.drag.offsetX;
    box.y = point.y - state.drag.offsetY;
  } else {
    const right = box.x + box.w;
    const bottom = box.y + box.h;
    if (state.drag.hit.corner.includes('n')) {
      const newY = Math.min(point.y, bottom - minSize);
      box.h = bottom - newY;
      box.y = newY;
    }
    if (state.drag.hit.corner.includes('s')) {
      box.h = Math.max(minSize, point.y - box.y);
    }
    if (state.drag.hit.corner.includes('w')) {
      const newX = Math.min(point.x, right - minSize);
      box.w = right - newX;
      box.x = newX;
    }
    if (state.drag.hit.corner.includes('e')) {
      box.w = Math.max(minSize, point.x - box.x);
    }
  }

  box.x = Math.max(0, Math.min(canvas.width - box.w, box.x));
  box.y = Math.max(0, Math.min(canvas.height - box.h, box.y));
  drawCabinet();
}

function exportImage() {
  if (!state.cabinet) {
    updateStatus('请先上传柜子样板图');
    return;
  }
  const width = Number(els.exportSize.value);
  const out = document.createElement('canvas');
  out.width = width;
  out.height = Math.round(width * 4 / 3);
  const outCtx = out.getContext('2d', { willReadFrequently: true });
  drawCabinet(outCtx, out, false);

  const link = document.createElement('a');
  link.download = `wardrobe-handle-${out.width}x${out.height}.png`;
  link.href = out.toDataURL('image/png');
  link.click();
  updateStatus(`已导出 ${out.width}×${out.height} 无水印 PNG`);
}

function updateStatus(message) {
  els.statusText.textContent = message;
}

els.cabinetInput.addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  state.cabinet = await loadImageFromFile(file);
  state.handleBox = null;
  fitCabinetToCanvas();
  resetHandleBox();
  drawCabinet();
  updateStatus(`柜子图已载入：${state.cabinet.width}×${state.cabinet.height}`);
});

els.handleInput.addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  state.handle = await loadImageFromFile(file);
  preprocessHandle();
  drawCabinet();
  updateStatus(`拉手图已载入：${state.handle.width}×${state.handle.height}`);
});

[els.rotation, els.scale, els.removeBg, els.fillOldHandle].forEach((control) => {
  control.addEventListener('input', () => {
    els.rotationValue.textContent = `${els.rotation.value}°`;
    els.scaleValue.textContent = `${els.scale.value}%`;
    if (control === els.removeBg) preprocessHandle();
    drawCabinet();
  });
});

els.downloadBtn.addEventListener('click', exportImage);
els.resetBtn.addEventListener('click', () => {
  if (!state.cabinet) return;
  resetHandleBox();
  drawCabinet();
  updateStatus('定位框已重置');
});
els.fitBtn.addEventListener('click', () => {
  fitCabinetToCanvas();
  drawCabinet();
});

canvas.addEventListener('pointerdown', (event) => {
  const point = pointerToCanvas(event);
  const hit = hitTest(point);
  if (!hit || !state.handleBox) return;
  canvas.setPointerCapture(event.pointerId);
  state.drag = {
    hit,
    offsetX: point.x - state.handleBox.x,
    offsetY: point.y - state.handleBox.y,
  };
});

canvas.addEventListener('pointermove', (event) => {
  if (!state.drag) return;
  updateBoxFromDrag(pointerToCanvas(event));
});

canvas.addEventListener('pointerup', (event) => {
  state.drag = null;
  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
});

canvas.addEventListener('pointerleave', () => {
  state.drag = null;
});

preprocessHandle();
drawCabinet();
