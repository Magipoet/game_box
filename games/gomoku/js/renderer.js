(function() {
  'use strict';

  window.Gomoku = window.Gomoku || {};
  var G = window.Gomoku;
  var state = G.state;

  G.renderer = {
    draw: draw,
    resizeCanvas: resizeCanvas,
    renderBackgroundToCache: renderBackgroundToCache,
    shadeColor: shadeColor,
    getCssVar: getCssVar
  };

  function resizeCanvas() {
    var wrapper = state.canvas.parentElement;
    var isMobile = window.innerWidth <= 768;
    var marginOffset = isMobile ? 12 : 40;
    var maxWidth = Math.min(wrapper.clientWidth - marginOffset, 600);
    var size = Math.max(300, maxWidth);
    var paddingRatio = isMobile ? 0.5 : 1;
    var divisor = (G.BOARD_SIZE - 1) + paddingRatio * 2;
    var cellSize = Math.floor(size / divisor);
    var padding = cellSize * paddingRatio;
    state.canvas.width = cellSize * (G.BOARD_SIZE - 1) + padding * 2;
    state.canvas.height = cellSize * (G.BOARD_SIZE - 1) + padding * 2;
    state.cellSize = cellSize;
    state.padding = padding;

    if (!state.bgCanvas) {
      state.bgCanvas = document.createElement('canvas');
      state.bgCtx = state.bgCanvas.getContext('2d');
    }
    state.bgCanvas.width = state.canvas.width;
    state.bgCanvas.height = state.canvas.height;
    renderBackgroundToCache();

    if (state.board) { draw(); }
  }

  function renderBackgroundToCache() {
    var w = state.bgCanvas.width;
    var h = state.bgCanvas.height;
    state.bgCtx.clearRect(0, 0, w, h);

    var boardBg = getCssVar('--board-bg') || '#e8c570';
    state.bgCtx.fillStyle = boardBg;
    state.bgCtx.fillRect(0, 0, w, h);

    var theme = state.currentTheme;
    if (theme === 'classic' || theme === 'walnut' || theme === 'sunset') {
      drawWoodGrainToContext(state.bgCtx, boardBg, w, h);
    } else if (theme === 'jade' || theme === 'forest') {
      drawStoneTextureToContext(state.bgCtx, boardBg, w, h);
    } else if (theme === 'midnight') {
      drawDarkTextureToContext(state.bgCtx, boardBg, w, h);
    }
  }

  function getCssVar(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }

  function draw() {
    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    drawBoardBackground();
    drawBoard();
    drawStones();
    if (state.lastMove && !state.winLine) drawLastMoveMarker();
    if (state.winLine) drawWinLine();
  }

  function drawBoardBackground() {
    if (state.bgCanvas) {
      state.ctx.drawImage(state.bgCanvas, 0, 0);
    } else {
      var boardBg = getCssVar('--board-bg') || '#e8c570';
      state.ctx.fillStyle = boardBg;
      state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
    }
  }

  function drawWoodGrain(baseColor) {
    drawWoodGrainToContext(state.ctx, baseColor, state.canvas.width, state.canvas.height);
  }

  function drawWoodGrainToContext(context, baseColor, w, h) {
    var grad = context.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, shadeColor(baseColor, 8));
    grad.addColorStop(0.5, baseColor);
    grad.addColorStop(1, shadeColor(baseColor, -8));
    context.fillStyle = grad;
    context.fillRect(0, 0, w, h);

    context.save();
    context.globalAlpha = 0.06;
    for (var i = 0; i < 40; i++) {
      var y = Math.random() * h;
      context.strokeStyle = shadeColor(baseColor, -15);
      context.lineWidth = Math.random() * 2 + 0.5;
      context.beginPath();
      var startX = 0;
      var amplitude = Math.random() * 8 + 2;
      var frequency = Math.random() * 0.02 + 0.005;
      context.moveTo(startX, y);
      for (var x = 0; x <= w; x += 5) {
        var yy = y + Math.sin(x * frequency) * amplitude;
        context.lineTo(x, yy);
      }
      context.stroke();
    }
    context.restore();

    context.save();
    context.globalAlpha = 0.08;
    for (var j = 0; j < 15; j++) {
      var cx = Math.random() * w;
      var cy = Math.random() * h;
      var radius = Math.random() * 20 + 5;
      var knotGrad = context.createRadialGradient(cx, cy, 0, cx, cy, radius);
      knotGrad.addColorStop(0, shadeColor(baseColor, -20));
      knotGrad.addColorStop(1, 'transparent');
      context.fillStyle = knotGrad;
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();

    context.save();
    context.globalAlpha = 0.05;
    var vignette = context.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, shadeColor(baseColor, -25));
    context.fillStyle = vignette;
    context.fillRect(0, 0, w, h);
    context.restore();
  }

  function drawStoneTexture(baseColor) {
    drawStoneTextureToContext(state.ctx, baseColor, state.canvas.width, state.canvas.height);
  }

  function drawStoneTextureToContext(context, baseColor, w, h) {
    context.save();
    context.globalAlpha = 0.1;
    for (var i = 0; i < 25; i++) {
      var cx = Math.random() * w;
      var cy = Math.random() * h;
      var r = Math.random() * 15 + 3;
      var grad = context.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, shadeColor(baseColor, 15));
      grad.addColorStop(1, 'transparent');
      context.fillStyle = grad;
      context.beginPath();
      context.arc(cx, cy, r, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();

    context.save();
    context.globalAlpha = 0.08;
    var vignette = context.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w * 0.75);
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, shadeColor(baseColor, -20));
    context.fillStyle = vignette;
    context.fillRect(0, 0, w, h);
    context.restore();
  }

  function drawDarkTexture(baseColor) {
    drawDarkTextureToContext(state.ctx, baseColor, state.canvas.width, state.canvas.height);
  }

  function drawDarkTextureToContext(context, baseColor, w, h) {
    context.save();
    context.globalAlpha = 0.15;
    for (var i = 0; i < 60; i++) {
      var x = Math.random() * w;
      var y = Math.random() * h;
      var size = Math.random() * 2 + 0.5;
      context.fillStyle = shadeColor(baseColor, 30);
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }

  function shadeColor(color, percent) {
    var hex = color.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    var num = parseInt(hex, 16);
    var amt = Math.round(2.55 * percent);
    var r = Math.min(255, Math.max(0, (num >> 16) + amt));
    var g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    var b = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  }

  function drawBoard() {
    var offset = state.padding;
    var gridEnd = state.padding + state.cellSize * (G.BOARD_SIZE - 1);
    var boardLine = getCssVar('--board-line') || '#3d2b10';

    state.ctx.save();
    state.ctx.strokeStyle = boardLine;
    state.ctx.lineWidth = 1;

    for (var i = 0; i < G.BOARD_SIZE; i++) {
      var pos = offset + i * state.cellSize;
      state.ctx.beginPath();
      state.ctx.moveTo(pos, offset);
      state.ctx.lineTo(pos, gridEnd);
      state.ctx.stroke();
      state.ctx.beginPath();
      state.ctx.moveTo(offset, pos);
      state.ctx.lineTo(gridEnd, pos);
      state.ctx.stroke();
    }

    state.ctx.strokeStyle = boardLine;
    state.ctx.lineWidth = 2;
    state.ctx.strokeRect(offset, offset, gridEnd - offset, gridEnd - offset);

    state.ctx.fillStyle = boardLine;
    var starPoints = [
      [3, 3], [3, 11], [11, 3], [11, 11], [7, 7],
      [3, 7], [11, 7], [7, 3], [7, 11]
    ];
    var starRadius = Math.max(3, state.cellSize * 0.08);
    starPoints.forEach(function(p) {
      var sx = offset + p[0] * state.cellSize;
      var sy = offset + p[1] * state.cellSize;
      state.ctx.beginPath();
      state.ctx.arc(sx, sy, starRadius, 0, Math.PI * 2);
      state.ctx.fill();
    });
    state.ctx.restore();
  }

  function drawStones() {
    var offset = state.padding;
    for (var r = 0; r < G.BOARD_SIZE; r++) {
      for (var c = 0; c < G.BOARD_SIZE; c++) {
        if (state.board[r][c] !== G.EMPTY) {
          drawStone(offset + c * state.cellSize, offset + r * state.cellSize, state.board[r][c]);
        }
      }
    }
  }

  function drawStone(x, y, player) {
    var radius = state.cellSize * 0.42;

    state.ctx.save();
    state.ctx.beginPath();
    state.ctx.arc(x + 1, y + 2, radius, 0, Math.PI * 2);
    state.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    state.ctx.fill();
    state.ctx.restore();

    var gradient = state.ctx.createRadialGradient(
      x - radius * 0.3, y - radius * 0.3, radius * 0.1,
      x, y, radius
    );

    if (player === G.BLACK) {
      gradient.addColorStop(0, '#666');
      gradient.addColorStop(0.3, '#333');
      gradient.addColorStop(0.7, '#1a1a1a');
      gradient.addColorStop(1, '#000');
    } else {
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.5, '#f0f0f0');
      gradient.addColorStop(0.85, '#d8d8d8');
      gradient.addColorStop(1, '#b0b0b0');
    }

    state.ctx.beginPath();
    state.ctx.arc(x, y, radius, 0, Math.PI * 2);
    state.ctx.fillStyle = gradient;
    state.ctx.fill();

    state.ctx.beginPath();
    state.ctx.arc(x, y, radius, 0, Math.PI * 2);
    state.ctx.strokeStyle = player === G.BLACK ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)';
    state.ctx.lineWidth = 0.8;
    state.ctx.stroke();

    state.ctx.beginPath();
    state.ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.25, 0, Math.PI * 2);
    state.ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    state.ctx.fill();
  }

  function drawGhostStone(row, col, player) {
    var offset = state.padding;
    var x = offset + col * state.cellSize;
    var y = offset + row * state.cellSize;
    var radius = state.cellSize * 0.42;

    state.ctx.save();
    state.ctx.globalAlpha = 0.3;
    var gradient = state.ctx.createRadialGradient(
      x - radius * 0.3, y - radius * 0.3, radius * 0.1,
      x, y, radius
    );
    if (player === G.BLACK) {
      gradient.addColorStop(0, '#555');
      gradient.addColorStop(1, '#000');
    } else {
      gradient.addColorStop(0, '#fff');
      gradient.addColorStop(1, '#ccc');
    }
    state.ctx.beginPath();
    state.ctx.arc(x, y, radius, 0, Math.PI * 2);
    state.ctx.fillStyle = gradient;
    state.ctx.fill();
    state.ctx.restore();
  }

  function drawLastMoveMarker() {
    if (!state.lastMove) return;
    var offset = state.padding;
    var x = offset + state.lastMove.col * state.cellSize;
    var y = offset + state.lastMove.row * state.cellSize;
    var markerRadius = state.cellSize * 0.12;

    state.ctx.beginPath();
    state.ctx.arc(x, y, markerRadius, 0, Math.PI * 2);
    state.ctx.fillStyle = '#e74c3c';
    state.ctx.fill();
    state.ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    state.ctx.lineWidth = 1.5;
    state.ctx.stroke();
  }

  function drawWinLine() {
    if (!state.winLine) return;
    var offset = state.padding;
    var x1 = offset + state.winLine.startC * state.cellSize;
    var y1 = offset + state.winLine.startR * state.cellSize;
    var x2 = offset + state.winLine.endC * state.cellSize;
    var y2 = offset + state.winLine.endR * state.cellSize;

    state.ctx.save();
    state.ctx.beginPath();
    state.ctx.moveTo(x1, y1);
    state.ctx.lineTo(x2, y2);
    state.ctx.strokeStyle = '#e74c3c';
    state.ctx.lineWidth = Math.max(4, state.cellSize * 0.08);
    state.ctx.lineCap = 'round';
    state.ctx.globalAlpha = 0.8;
    state.ctx.stroke();
    state.ctx.restore();
  }

  G.renderer.drawGhostStone = drawGhostStone;
})();
