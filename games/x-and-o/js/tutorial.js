(function () {
  'use strict';

  var XOApp = window.XOApp;
  var state = XOApp.state;
  var els = XOApp.els;

  var {
    PLAYER_X,
    PLAYER_O,
    MODE_NORMAL,
    MODE_FUN,
    makeMove,
    usePersist,
  } = window.XOGame;

  function setGuidePosition(guideEl, targetRect, padding) {
    padding = padding || 4;
    guideEl.style.width = (targetRect.width + padding * 2) + 'px';
    guideEl.style.height = (targetRect.height + padding * 2) + 'px';
    var tx = (targetRect.left - padding);
    var ty = (targetRect.top - padding);
    guideEl.style.transform = 'translate(' + tx + 'px, ' + ty + 'px) scale(1)';
  }

  function addGuideTimeout(id) {
    state.tutorial.guideTimeouts.push(id);
  }

  function clearAllGuideTimeouts() {
    for (var i = 0; i < state.tutorial.guideTimeouts.length; i++) {
      clearTimeout(state.tutorial.guideTimeouts[i]);
    }
    state.tutorial.guideTimeouts = [];
  }

  function showTutorialCellGuide() {
    hideTutorialCellGuide();
    if (!state.tutorial.interactionCell) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (!state.tutorial.interactionCell) return;
          var cell = els.board.querySelector('.cell[data-row="' + state.tutorial.interactionCell[0] + '"][data-col="' + state.tutorial.interactionCell[1] + '"]');
          if (!cell) return;
          var rect = cell.getBoundingClientRect();
          var guide = document.createElement('div');
          guide.className = 'tutorial-cell-guide';
          setGuidePosition(guide, rect, 4);
          document.body.appendChild(guide);
          state.tutorial.guideElement = guide;
        });
      });
    });
  }

  function updateTutorialHighlightPosition() {
    var step = TUTORIAL_STEPS[state.tutorial.currentStep];
    if (!step || !step.target) return;
    if (els.tutorialOverlay.classList.contains('modal-mode')) return;
    var targetEl = document.querySelector(step.target);
    if (!targetEl) return;
    if (targetEl.classList && targetEl.classList.contains('cell')) return;
    var rect = targetEl.getBoundingClientRect();
    var padding = 8;
    els.tutorialHighlight.style.left = (rect.left - padding) + 'px';
    els.tutorialHighlight.style.top = (rect.top - padding) + 'px';
    els.tutorialHighlight.style.width = (rect.width + padding * 2) + 'px';
    els.tutorialHighlight.style.height = (rect.height + padding * 2) + 'px';
  }

  function hideTutorialCellGuide() {
    clearAllGuideTimeouts();
    if (state.tutorial.guideElement) {
      state.tutorial.guideElement.remove();
      state.tutorial.guideElement = null;
    }
  }

  function positionTutorialTooltip(targetRect, position, targetEl, forcePosition, extraGap) {
    var tooltip = els.tutorialTooltip;
    var tooltipWidth = 400;
    var tooltipHeight = 180;
    var gap = 16 + (extraGap || 0);
    var arrowOffset = 24;

    if (window.innerWidth <= 800 && (position === 'left' || position === 'right') && targetRect.width > window.innerWidth * 0.5) {
      position = 'top';
    }

    if (position === 'left') {
      tooltipWidth = 260;
      tooltipHeight = 280;
    }

    if (window.innerWidth <= 800) {
      tooltipWidth = Math.min(tooltipWidth, window.innerWidth - 32);
      tooltipHeight = 220;
    }

    var currentTransform = tooltip.style.transform;
    var currentLeft = tooltip.style.left;
    var currentTop = tooltip.style.top;
    var isFromCenter = currentTransform && currentTransform.indexOf('translate') !== -1 && currentLeft === '50%' && currentTop === '50%';

    tooltip.classList.remove('arrow-top', 'arrow-bottom', 'arrow-left', 'arrow-right');
    tooltip.style.transform = 'none';
    tooltip.style.setProperty('--arrow-offset-x', '24px');
    tooltip.style.setProperty('--arrow-offset-y', '24px');

    var left, top;

    switch (position) {
      case 'top':
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        top = targetRect.top - tooltipHeight - gap;
        tooltip.classList.add('arrow-bottom');
        break;
      case 'bottom':
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        top = targetRect.bottom + gap;
        tooltip.classList.add('arrow-top');
        break;
      case 'left':
        left = targetRect.left - tooltipWidth - gap;
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        tooltip.classList.add('arrow-right');
        break;
      case 'right':
        left = targetRect.right + gap;
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        tooltip.classList.add('arrow-left');
        break;
    }

    if (!forcePosition) {
      if (position === 'top' && targetEl) {
        var spaceAbove = targetRect.top - gap - 16;
        if (spaceAbove >= tooltipHeight) {
          top = targetRect.top - tooltipHeight - gap;
        } else {
          position = 'bottom';
          top = targetRect.bottom + gap;
          tooltip.classList.remove('arrow-bottom');
          tooltip.classList.add('arrow-top');
        }
      }

      if (position === 'bottom' && targetEl) {
        var spaceBelow = window.innerHeight - targetRect.bottom - gap - 16;
        if (spaceBelow < tooltipHeight) {
          position = 'top';
          top = targetRect.top - tooltipHeight - gap;
          tooltip.classList.remove('arrow-top');
          tooltip.classList.add('arrow-bottom');
        }
      }
    }

    if (left < 16) left = 16;
    if (left + tooltipWidth > window.innerWidth - 16) left = window.innerWidth - tooltipWidth - 16;
    if (top < 16) top = 16;
    if (top + tooltipHeight > window.innerHeight - 16) top = window.innerHeight - tooltipHeight - 16;

    var targetCenterX = targetRect.left + targetRect.width / 2;
    var targetCenterY = targetRect.top + targetRect.height / 2;
    var minArrowOffset = 20;
    var maxArrowOffsetX = tooltipWidth - 20;
    var maxArrowOffsetY = tooltipHeight - 20;

    if (position === 'top' || position === 'bottom') {
      var arrowX = targetCenterX - left - 6;
      arrowX = Math.max(minArrowOffset, Math.min(maxArrowOffsetX, arrowX));
      tooltip.style.setProperty('--arrow-offset-x', arrowX + 'px');
    } else if (position === 'left' || position === 'right') {
      var arrowY = targetCenterY - top - 6;
      arrowY = Math.max(minArrowOffset, Math.min(maxArrowOffsetY, arrowY));
      tooltip.style.setProperty('--arrow-offset-y', arrowY + 'px');
    }

    if (position === 'left') {
      tooltip.style.width = tooltipWidth + 'px';
    } else {
      tooltip.style.width = '';
    }

    function setFinalPosition() {
      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
    }

    if (isFromCenter) {
      var curRect = tooltip.getBoundingClientRect();
      tooltip.style.transition = 'none';
      if (position === 'left') {
        tooltip.style.width = tooltipWidth + 'px';
      } else {
        tooltip.style.width = '';
      }
      if (window.innerWidth <= 800) {
        tooltip.style.minHeight = '140px';
        tooltip.style.boxSizing = 'border-box';
      }
      tooltip.style.left = curRect.left + 'px';
      tooltip.style.top = curRect.top + 'px';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          tooltip.style.transition = 'left 0.3s ease, top 0.3s ease';
          setFinalPosition();
          setTimeout(function () {
            tooltip.style.transition = '';
            tooltip.style.minHeight = '';
            tooltip.style.boxSizing = '';
          }, 350);
        });
      });
    } else {
      setFinalPosition();
    }
  }

  function showTutorialUndoGuide() {
    hideTutorialCellGuide();
    state.tutorial.allowedButton = '#btnUndoX';
    state.tutorial.manualPositioning = true;
    els.tutorialContent.innerHTML = '<h3 style="margin:0 0 8px;font-size:16px;">撤回能力</h3><p style="margin:0;">刚刚你在右下角落下了一枚 X 棋子。<br><br>现在请点击<strong>闪烁的撤回按钮</strong>，撤回刚才的落子，观察棋子消失的效果。</p>';
    els.tutorialOverlay.classList.add('interaction-mode');
    var position;
    var forcePosition = false;
    if (window.innerWidth <= 800) {
      position = 'bottom';
      forcePosition = true;
    } else {
      position = 'left';
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var targetEl = document.querySelector('#btnUndoX');
          if (!targetEl) return;
          var rect = targetEl.getBoundingClientRect();
          var guide = document.createElement('div');
          guide.className = 'tutorial-cell-guide';
          setGuidePosition(guide, rect, 4);
          document.body.appendChild(guide);
          state.tutorial.guideElement = guide;
          positionTutorialTooltip(rect, position, targetEl, forcePosition);
        });
      });
    });
  }

  function showTutorialFreezeBtnGuide() {
    hideTutorialCellGuide();
    state.tutorial.allowedButton = '#btnFreezeX';
    state.tutorial.manualPositioning = true;
    els.tutorialContent.innerHTML = '<h3 style="margin:0 0 8px;font-size:16px;">固定能力</h3><p style="margin:0;"><strong>固定</strong>：点击后选择一个空格子，对方无法在此落子，固定会在对方下一次落子后解除。<br><br>现在请点击<strong>闪烁的固定按钮</strong>，激活固定能力。</p>';
    els.tutorialOverlay.classList.add('interaction-mode');
    var position;
    var forcePosition = false;
    if (window.innerWidth <= 800) {
      position = 'bottom';
      forcePosition = true;
    } else {
      position = 'left';
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var targetEl = document.querySelector('#btnFreezeX');
          if (!targetEl) return;
          var rect = targetEl.getBoundingClientRect();
          var guide = document.createElement('div');
          guide.className = 'tutorial-cell-guide';
          setGuidePosition(guide, rect, 4);
          document.body.appendChild(guide);
          state.tutorial.guideElement = guide;
          positionTutorialTooltip(rect, position, targetEl, forcePosition);
        });
      });
    });
  }

  function showTutorialFreezeCellGuide() {
    hideTutorialCellGuide();
    if (!state.tutorial.interactionCell) return;
    els.tutorialContent.innerHTML = '<h3 style="margin:0 0 8px;font-size:16px;">固定能力</h3><p style="margin:0;">固定能力已激活！<br><br>现在请点击棋盘上<strong>闪烁的格子</strong>，将该格子设为固定状态。</p>';
    var extraTopGap = window.innerWidth <= 800 ? 36 : 28;
    var tooltipWidth = window.innerWidth <= 800 ? Math.min(window.innerWidth - 32, 400) : 400;
    var tooltipHeight = window.innerWidth <= 800 ? 160 : 200;
    var gap = 16;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var cell = els.board.querySelector('.cell[data-row="' + state.tutorial.interactionCell[0] + '"][data-col="' + state.tutorial.interactionCell[1] + '"]');
          if (!cell) return;
          var rect = cell.getBoundingClientRect();
          var guide = document.createElement('div');
          guide.className = 'tutorial-cell-guide';
          setGuidePosition(guide, rect, 4);
          document.body.appendChild(guide);
          state.tutorial.guideElement = guide;
          var left = rect.left + rect.width / 2 - tooltipWidth / 2;
          if (left < 16) left = 16;
          if (left + tooltipWidth > window.innerWidth - 16) left = window.innerWidth - tooltipWidth - 16;

          var spaceAbove = rect.top - gap - extraTopGap - 16;
          var spaceBelow = window.innerHeight - rect.bottom - gap - extraTopGap - 16;
          var top;
          if (spaceAbove >= tooltipHeight || spaceAbove >= spaceBelow) {
            top = rect.top - tooltipHeight - gap - extraTopGap;
            if (top < 16) {
              top = Math.max(16, rect.bottom + gap + extraTopGap);
              els.tutorialTooltip.className = 'tutorial-tooltip arrow-top';
            } else {
              els.tutorialTooltip.className = 'tutorial-tooltip arrow-bottom';
            }
          } else {
            top = rect.bottom + gap + extraTopGap;
            if (top + tooltipHeight > window.innerHeight - 16) {
              top = Math.min(window.innerHeight - tooltipHeight - 16, rect.top - tooltipHeight - gap - extraTopGap);
              els.tutorialTooltip.className = 'tutorial-tooltip arrow-bottom';
            } else {
              els.tutorialTooltip.className = 'tutorial-tooltip arrow-top';
            }
          }
          if (top < 16) top = 16;
          if (top + tooltipHeight > window.innerHeight - 16) top = window.innerHeight - tooltipHeight - 16;
          var arrowOffsetX = (rect.left + rect.width / 2) - left - 6;
          arrowOffsetX = Math.max(20, Math.min(tooltipWidth - 20, arrowOffsetX));
          els.tutorialTooltip.style.setProperty('--arrow-offset-x', arrowOffsetX + 'px');
          els.tutorialTooltip.style.left = left + 'px';
          els.tutorialTooltip.style.top = top + 'px';
          els.tutorialTooltip.style.transform = 'none';
          els.tutorialTooltip.style.width = window.innerWidth <= 800 ? tooltipWidth + 'px' : '';
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              var curCell = els.board.querySelector('.cell[data-row="' + state.tutorial.interactionCell[0] + '"][data-col="' + state.tutorial.interactionCell[1] + '"]');
              if (!curCell) return;
              var curRect = curCell.getBoundingClientRect();
              if (state.tutorial.guideElement) {
                setGuidePosition(state.tutorial.guideElement, curRect, 4);
              }
              var curTooltipRect = els.tutorialTooltip.getBoundingClientRect();
              var curTooltipHeight = curTooltipRect.height;
              var curTooltipWidth = curTooltipRect.width;
              var curLeft = curRect.left + curRect.width / 2 - curTooltipWidth / 2;
              if (curLeft < 16) curLeft = 16;
              if (curLeft + curTooltipWidth > window.innerWidth - 16) curLeft = window.innerWidth - curTooltipWidth - 16;
              var curTop = curRect.top - curTooltipHeight - gap - extraTopGap;
              var curArrow = 'arrow-bottom';
              if (curTop < 16) {
                curTop = curRect.bottom + gap + extraTopGap;
                curArrow = 'arrow-top';
              }
              if (curTop + curTooltipHeight > window.innerHeight - 16) {
                curTop = window.innerHeight - curTooltipHeight - 16;
              }
              var curArrowOffsetX = (curRect.left + curRect.width / 2) - curLeft - 6;
              curArrowOffsetX = Math.max(20, Math.min(curTooltipWidth - 20, curArrowOffsetX));
              els.tutorialTooltip.className = 'tutorial-tooltip ' + curArrow;
              els.tutorialTooltip.style.setProperty('--arrow-offset-x', curArrowOffsetX + 'px');
              els.tutorialTooltip.style.left = curLeft + 'px';
              els.tutorialTooltip.style.top = curTop + 'px';
            });
          });
        });
      });
    });
  }

  function showTutorialCancelFreezeBtnGuide() {
    hideTutorialCellGuide();
    var targetEl = document.querySelector('#btnCancelFreeze');
    if (!targetEl) return;
    state.tutorial.allowedButton = '#btnCancelFreeze';
    state.tutorial.manualPositioning = true;
    els.tutorialContent.innerHTML = '<h3 style="margin:0 0 8px;font-size:16px;">取消固定</h3><p style="margin:0;">在选择目标格子前，你可以随时<strong>取消固定</strong>操作。<br><br>取消方式有两种：<br>• 点击下方的<strong>"取消"按钮</strong><br>• 再次点击<strong>固定按钮</strong><br><br>现在请点击<strong>闪烁的"取消"按钮</strong>，取消本次固定操作。</p>';
    els.tutorialOverlay.classList.add('interaction-mode');
    var sideTooltipWidth = Math.min(window.innerWidth - 32, 400);
    var sideTooltipHeight = 120;
    var sideGap = 10;
    els.tutorialTooltip.style.transition = 'none';
    els.tutorialTooltip.style.width = sideTooltipWidth + 'px';
    els.tutorialTooltip.style.visibility = 'hidden';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var curTargetEl = document.querySelector('#btnCancelFreeze');
          if (!curTargetEl) {
            els.tutorialTooltip.style.visibility = '';
            els.tutorialTooltip.style.transition = '';
            return;
          }
          var curRect = curTargetEl.getBoundingClientRect();
          var guide = document.createElement('div');
          guide.className = 'tutorial-cell-guide';
          setGuidePosition(guide, curRect, 4);
          document.body.appendChild(guide);
          state.tutorial.guideElement = guide;
          var curTooltipRect = els.tutorialTooltip.getBoundingClientRect();
          var curTooltipHeight = curTooltipRect.height || sideTooltipHeight;
          var curTooltipWidth = curTooltipRect.width || sideTooltipWidth;
          var curLeft = curRect.left + curRect.width / 2 - curTooltipWidth / 2;
          if (curLeft < 16) curLeft = 16;
          if (curLeft + curTooltipWidth > window.innerWidth - 16) curLeft = window.innerWidth - curTooltipWidth - 16;
          var curTop = curRect.top - curTooltipHeight - sideGap - 8;
          var curArrow = 'arrow-bottom';
          if (curTop < 16) {
            curTop = curRect.bottom + sideGap + 8;
            curArrow = 'arrow-top';
          }
          if (curTop + curTooltipHeight > window.innerHeight - 16) {
            curTop = window.innerHeight - curTooltipHeight - 16;
          }
          var arrowOffsetX = (curRect.left + curRect.width / 2) - curLeft - 6;
          arrowOffsetX = Math.max(20, Math.min(curTooltipWidth - 20, arrowOffsetX));
          els.tutorialTooltip.className = 'tutorial-tooltip ' + curArrow;
          els.tutorialTooltip.style.setProperty('--arrow-offset-x', arrowOffsetX + 'px');
          els.tutorialTooltip.style.left = curLeft + 'px';
          els.tutorialTooltip.style.top = curTop + 'px';
          els.tutorialTooltip.style.transform = 'none';
          els.tutorialTooltip.style.visibility = '';
          requestAnimationFrame(function () {
            els.tutorialTooltip.style.transition = '';
          });
        });
      });
    });
  }

  function showTutorialPersistBtnGuide() {
    hideTutorialCellGuide();
    state.tutorial.allowedButton = '#btnPersistX';
    state.tutorial.manualPositioning = true;
    els.tutorialContent.innerHTML = '<h3 style="margin:0 0 8px;font-size:16px;">保留能力</h3><p style="margin:0;"><strong>保留</strong>：点击激活后，下一步落子的棋子将保留五个回合，不会因为后续放置新棋子而被自动移除。<br><br>这是趣味模式中最具策略性的能力，善用它可锁定胜局！<br><br>现在请点击<strong>闪烁的保留按钮</strong>，激活保留能力。</p>';
    els.tutorialOverlay.classList.add('interaction-mode');
    var position;
    var forcePosition = false;
    if (window.innerWidth <= 800) {
      position = 'bottom';
      forcePosition = true;
    } else {
      position = 'left';
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var targetEl = document.querySelector('#btnPersistX');
          if (!targetEl) return;
          var rect = targetEl.getBoundingClientRect();
          var guide = document.createElement('div');
          guide.className = 'tutorial-cell-guide';
          setGuidePosition(guide, rect, 4);
          document.body.appendChild(guide);
          state.tutorial.guideElement = guide;
          positionTutorialTooltip(rect, position, targetEl, forcePosition);
        });
      });
    });
  }

  function showTutorialCancelPersistBtnGuide() {
    hideTutorialCellGuide();
    var targetEl = document.querySelector('#btnCancelPersist');
    if (!targetEl) return;
    state.tutorial.allowedButton = '#btnCancelPersist';
    state.tutorial.manualPositioning = true;
    els.tutorialContent.innerHTML = '<h3 style="margin:0 0 8px;font-size:16px;">取消保留</h3><p style="margin:0;">在落下保留棋子前，你可以随时<strong>取消保留</strong>操作。<br><br>取消方式有两种：<br>• 点击下方的<strong>"取消"按钮</strong><br>• 再次点击<strong>保留按钮</strong><br><br>现在请点击<strong>闪烁的"取消"按钮</strong>，取消本次保留操作。</p>';
    els.tutorialOverlay.classList.add('interaction-mode');
    var sideTooltipWidth = Math.min(window.innerWidth - 32, 400);
    var sideTooltipHeight = 120;
    var sideGap = 10;
    els.tutorialTooltip.style.transition = 'none';
    els.tutorialTooltip.style.width = sideTooltipWidth + 'px';
    els.tutorialTooltip.style.visibility = 'hidden';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var curTargetEl = document.querySelector('#btnCancelPersist');
          if (!curTargetEl) {
            els.tutorialTooltip.style.visibility = '';
            els.tutorialTooltip.style.transition = '';
            return;
          }
          var curRect = curTargetEl.getBoundingClientRect();
          var guide = document.createElement('div');
          guide.className = 'tutorial-cell-guide';
          setGuidePosition(guide, curRect, 4);
          document.body.appendChild(guide);
          state.tutorial.guideElement = guide;
          var curTooltipRect = els.tutorialTooltip.getBoundingClientRect();
          var curTooltipHeight = curTooltipRect.height || sideTooltipHeight;
          var curTooltipWidth = curTooltipRect.width || sideTooltipWidth;
          var curLeft = curRect.left + curRect.width / 2 - curTooltipWidth / 2;
          if (curLeft < 16) curLeft = 16;
          if (curLeft + curTooltipWidth > window.innerWidth - 16) curLeft = window.innerWidth - curTooltipWidth - 16;

          var safeMargin = 16;
          var spaceTop = curRect.top - sideGap - 8 - safeMargin;
          var spaceBottom = window.innerHeight - curRect.bottom - sideGap - 8 - safeMargin;
          var allowTop = spaceTop >= curTooltipHeight;
          var allowBottom = spaceBottom >= curTooltipHeight;
          var curTop;
          var curArrow;
          if (allowTop && allowBottom) {
            curTop = curRect.top - curTooltipHeight - sideGap - 8;
            curArrow = 'arrow-bottom';
          } else if (allowTop) {
            curTop = curRect.top - curTooltipHeight - sideGap - 8;
            curArrow = 'arrow-bottom';
          } else if (allowBottom) {
            curTop = curRect.bottom + sideGap + 8;
            curArrow = 'arrow-top';
          } else {
            if (spaceTop >= spaceBottom) {
              curTop = curRect.top - curTooltipHeight - sideGap - 8;
              curArrow = 'arrow-bottom';
            } else {
              curTop = curRect.bottom + sideGap + 8;
              curArrow = 'arrow-top';
            }
          }
          if (curTop < safeMargin) curTop = safeMargin;
          if (curTop + curTooltipHeight > window.innerHeight - safeMargin) {
            curTop = window.innerHeight - curTooltipHeight - safeMargin;
          }
          var arrowOffsetX = (curRect.left + curRect.width / 2) - curLeft - 6;
          arrowOffsetX = Math.max(20, Math.min(curTooltipWidth - 20, arrowOffsetX));
          els.tutorialTooltip.className = 'tutorial-tooltip ' + curArrow;
          els.tutorialTooltip.style.setProperty('--arrow-offset-x', arrowOffsetX + 'px');
          els.tutorialTooltip.style.left = curLeft + 'px';
          els.tutorialTooltip.style.top = curTop + 'px';
          els.tutorialTooltip.style.transform = 'none';
          els.tutorialTooltip.style.visibility = '';
          requestAnimationFrame(function () {
            els.tutorialTooltip.style.transition = '';
          });
        });
      });
    });
  }

  function showTutorialHelpBtnGuide() {
    hideTutorialCellGuide();
    state.tutorial.allowedButton = '#btnHelp';
    els.tutorialContent.innerHTML = '<h3 style="margin:0 0 8px;font-size:16px;">游戏帮助</h3><p style="margin:0;">点击此按钮可随时查看<strong>游戏帮助</strong>，了解完整的游戏规则和玩法说明。<br><br>现在请点击<strong>闪烁的帮助按钮</strong>，打开帮助弹窗查看。</p>';
    els.tutorialOverlay.classList.add('interaction-mode');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var targetEl = document.querySelector('#btnHelp');
          if (!targetEl) return;
          var rect = targetEl.getBoundingClientRect();
          var guide = document.createElement('div');
          guide.className = 'tutorial-cell-guide';
          setGuidePosition(guide, rect, 4);
          document.body.appendChild(guide);
          state.tutorial.guideElement = guide;
          positionTutorialTooltip(rect, 'bottom');
        });
      });
    });
  }

  function showTutorialSettingsBtnGuide() {
    hideTutorialCellGuide();
    state.tutorial.allowedButton = '#btnSettings';
    els.tutorialContent.innerHTML = '<h3 style="margin:0 0 8px;font-size:16px;">游戏设置</h3><p style="margin:0;">点击此按钮可打开<strong>设置</strong>，调整棋盘大小、棋子大小和主题配色，也可以在这里重新查看本教程。<br><br>现在请点击<strong>闪烁的设置按钮</strong>，打开设置弹窗查看。</p>';
    els.tutorialOverlay.classList.add('interaction-mode');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var targetEl = document.querySelector('#btnSettings');
          if (!targetEl) return;
          var rect = targetEl.getBoundingClientRect();
          var guide = document.createElement('div');
          guide.className = 'tutorial-cell-guide';
          setGuidePosition(guide, rect, 4);
          document.body.appendChild(guide);
          state.tutorial.guideElement = guide;
          positionTutorialTooltip(rect, 'bottom');
        });
      });
    });
  }

  function startPersistAutoDemo() {
    var xMoves = [
      { cell: [0, 1], stage: 3, text: '请点击<strong>闪烁的格子</strong>（上中）落下一枚 X 棋子。' },
      { cell: [1, 2], stage: 4, text: '请点击<strong>闪烁的格子</strong>（右中）落下一枚 X 棋子。' },
      { cell: [2, 1], stage: 5, text: '请点击<strong>闪烁的格子</strong>（下中）落下一枚 X 棋子。' },
      { cell: [1, 1], stage: 6, text: '请点击<strong>闪烁的格子</strong>（中心）落下一枚 X 棋子。' },
      { cell: [0, 1], stage: 7, text: '请点击<strong>闪烁的格子</strong>（上中）落下最后一枚 X 棋子，观察保留棋子（左下角）闪烁后消失！' },
    ];
    var oMoves = [[0, 0], [0, 2], [2, 2], [1, 0], [0, 0]];
    state.tutorial.persistStepIndex = 0;

    function showPersistReminder() {
      state.tutorial.waitingForInteraction = false;
      state.tutorial.persistStage = 9;
      els.tutorialContent.innerHTML = '<h3 style="margin:0 0 8px;font-size:16px;">保留效果演示</h3><p style="margin:0;">注意观察！现在 X 方已有 <strong>第4个棋子</strong>落下，普通棋子本应消失，但<strong>左下角的保留棋子（带 ⏳ 图标）</strong>依然存在！<br><br>这就是保留能力的作用：让关键位置更持久，点击"下一步"继续观看保留棋子消失的最终效果。</p>';
      els.tutorialOverlay.classList.remove('interaction-mode');
      hideTutorialCellGuide();
      var persistCell = els.board.querySelector('.cell[data-row="2"][data-col="0"]');
      if (persistCell) {
        persistCell.scrollIntoView({ behavior: 'auto', block: 'center' });
        updateTutorialHighlightPosition();
      }
    }

    function showXMoveGuide() {
      var idx = state.tutorial.persistStepIndex;
      if (idx >= xMoves.length) {
        var sp1 = setTimeout(function () {
          els.tutorialContent.innerHTML = '<h3 style="margin:0 0 8px;font-size:16px;">保留效果演示完成</h3><p style="margin:0;">观察到：<br>• 普通棋子3个回合后消失<br>• <strong>保留棋子5个回合后才消失</strong>（从左下角闪烁后消失）<br><br>善用保留能力可锁定关键位置，形成多子攻势！点击"下一步"继续教程。</p>';
          state.tutorial.waitingForInteraction = false;
          els.tutorialOverlay.classList.remove('interaction-mode');
        }, 800);
        addGuideTimeout(sp1);
        return;
      }
      var xMove = xMoves[idx];
      state.tutorial.waitingForInteraction = true;
      state.tutorial.interactionCell = xMove.cell;
      state.tutorial.persistStage = xMove.stage;
      els.tutorialContent.innerHTML = '<h3 style="margin:0 0 8px;font-size:16px;">保留效果演示</h3><p style="margin:0;">保留棋子在<strong>左下角 (2,0)</strong>，带 <strong>⏳</strong> 图标。<br><br>' + xMove.text + '</p>';
      els.tutorialOverlay.classList.add('interaction-mode');
      XOApp.render();
      var sp2 = setTimeout(showTutorialCellGuide, 100);
      addGuideTimeout(sp2);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var cellRow = xMove.cell[0];
          var cellCol = xMove.cell[1];
          var cell = els.board.querySelector('.cell[data-row="' + cellRow + '"][data-col="' + cellCol + '"]');
          if (cell) {
            var pos, fPos = false;
            var gap = 0;
            var targetRect, targetEl;
            if (window.innerWidth <= 800) {
              var mBoardEl = document.querySelector('#board');
              if (mBoardEl) {
                var mBoardRect = mBoardEl.getBoundingClientRect();
                var mSpaceTop = mBoardRect.top;
                var mSpaceBottom = window.innerHeight - mBoardRect.bottom;
                var mEstTooltipH = 220;
                var mSafeMargin = 32;
                var mAllowTop = (cellRow !== 0) && (mSpaceTop >= mEstTooltipH + mSafeMargin);
                var mAllowBottom = (cellRow !== 2) && (mSpaceBottom >= mEstTooltipH + mSafeMargin);
                var mFinalPos;
                if (mAllowTop && mAllowBottom) {
                  mFinalPos = mSpaceTop >= mSpaceBottom ? 'top' : 'bottom';
                } else if (mAllowTop) {
                  mFinalPos = 'top';
                } else if (mAllowBottom) {
                  mFinalPos = 'bottom';
                } else {
                  var mFallbackAllowTop = cellRow !== 0;
                  var mFallbackAllowBottom = cellRow !== 2;
                  if (mFallbackAllowTop && mFallbackAllowBottom) {
                    mFinalPos = mSpaceTop >= mSpaceBottom ? 'top' : 'bottom';
                  } else if (mFallbackAllowTop) {
                    mFinalPos = 'top';
                  } else if (mFallbackAllowBottom) {
                    mFinalPos = 'bottom';
                  } else {
                    mFinalPos = mSpaceTop >= mSpaceBottom ? 'top' : 'bottom';
                  }
                }
                targetRect = mBoardRect;
                targetEl = mBoardEl;
                pos = mFinalPos;
                fPos = true;
                gap = 16;
              }
            } else {
              targetRect = cell.getBoundingClientRect();
              targetEl = cell;
              pos = 'right';
              gap = 20;
              fPos = true;
            }
            if (targetRect) {
              positionTutorialTooltip(targetRect, pos, targetEl, fPos, gap);
            }
          }
        });
      });
    }

    function doOMove() {
      var idx = state.tutorial.persistStepIndex;
      if (idx >= oMoves.length) {
        showXMoveGuide();
        return;
      }
      var oMove = oMoves[idx];
      state.game = makeMove(state.game, oMove[0], oMove[1]);
      XOApp.render();
      var sp3 = setTimeout(showXMoveGuide, 500);
      addGuideTimeout(sp3);
    }

    state.tutorial.persistAutoNextOMove = doOMove;
    state.tutorial.showPersistReminder = showPersistReminder;
    if (state.game.currentPlayer === PLAYER_O) {
      doOMove();
    } else {
      showXMoveGuide();
    }
  }

  var TUTORIAL_STEPS = [
    {
      target: null,
      title: '欢迎游玩动态井字棋游戏',
      content: '欢迎来到 <strong>X&amp;O - 动态井字棋</strong>！<br><br>这是一款打破传统井字棋僵局的创新策略游戏，每名玩家最多同时存在 3 个棋子，最早放置的棋子会被自动移除，让游戏始终充满变数。<br><br>接下来让我们一步步了解游戏界面和玩法。',
      position: 'center',
    },
    {
      target: '#board',
      title: '棋盘区域',
      content: '这是游戏的核心区域——<strong>棋盘</strong>。点击任意空白格子即可落子，先将自己的 3 个棋子连成一条直线（横向、纵向或斜向）即可获胜！<br><br>现在棋盘上 X 已有 2 个棋子，请点击<strong>闪烁的格子</strong>落下第 3 个棋子，连成一线获胜！',
      position: 'top',
      onEnter: function () {
        XOApp.resetGame(MODE_NORMAL);
        var demoMoves = [[0, 2], [0, 0], [1, 2], [1, 0]];
        for (var i = 0; i < demoMoves.length; i++) {
          var move = demoMoves[i];
          state.game = makeMove(state.game, move[0], move[1]);
        }
        state.tutorial.waitingForInteraction = true;
        state.tutorial.interactionCell = [2, 2];
        state.tutorial.isWinStep = true;
        XOApp.render();
        var st1 = setTimeout(showTutorialCellGuide, 100);
        addGuideTimeout(st1);
      },
    },
    {
      target: '#statusText',
      title: '当前玩家',
      content: '这里显示<strong>当前轮到哪方落子</strong>。X（蓝色）先手，O（橙色）后手，双方轮流行动。',
      position: 'bottom',
    },
    {
      target: '#board',
      title: '动态棋子机制',
      content: '<strong>这是本游戏最核心的机制！</strong><br><br>每名玩家最多同时存在 <strong>3 个棋子</strong>，当落下第 4 个棋子时，最早放置的棋子会自动消失。<br><br>现在棋盘上 X 已有 3 个棋子，请点击棋盘上<strong>闪烁的格子</strong>落下第 4 个棋子，观察最早的棋子(左上角)消失的效果！<br><br>在趣味模式中，使用<strong>保留键</strong>可让棋子多停留几个回合。',
      position: 'right',
      onEnter: function () {
        XOApp.resetGame(MODE_NORMAL);
        var demoMoves = [[0, 0], [1, 0], [0, 2], [2, 0], [2, 1], [1, 2]];
        for (var i = 0; i < demoMoves.length; i++) {
          var move = demoMoves[i];
          state.game = makeMove(state.game, move[0], move[1]);
        }
        state.tutorial.waitingForInteraction = true;
        state.tutorial.interactionCell = [2, 2];
        state.tutorial.animateDisappear = true;
        state.tutorial.disappearCell = [0, 0];
        XOApp.render();
        var st2 = setTimeout(showTutorialCellGuide, 100);
        addGuideTimeout(st2);
      },
    },
    {
      target: '#btnMode',
      title: '游戏模式',
      content: '点击此按钮可切换<strong>游戏模式</strong>。<br><br>• <strong>常规模式</strong>：标准动态井字棋，支持撤回和重新开始<br>• <strong>趣味模式</strong>：每位玩家拥有撤回、固定、保留三种特殊能力<br><br>点击"下一步"将打开模式选择弹窗。',
      position: 'left',
      onEnter: function () {
        XOApp.hideModal(els.modeModal);
        els.tutorialOverlay.classList.remove('modal-mode');
        XOApp.resetGame(MODE_NORMAL);
      },
    },
    {
      target: '.mode-tile[data-mode="fun"]',
      title: '选择趣味模式',
      content: '现在弹出了<strong>游戏模式选择</strong>弹窗。<br><br>请点击右侧高亮的<strong>"趣味模式"</strong>卡片，即可进入趣味模式界面，体验撤回、固定、保留三种特殊能力。<br><br>也可直接点击"下一步"自动切换到趣味模式。',
      position: 'left',
      onEnter: function () {
        XOApp.resetGame(MODE_NORMAL);
        XOApp.showModal(els.modeModal);
        els.tutorialOverlay.classList.add('modal-mode');
        els.tutorialOverlay.classList.add('button-interaction-mode');
        state.tutorial.modeStage = 2;
        state.tutorial.waitingForInteraction = true;
        state.tutorial.allowedButton = '.mode-tile[data-mode="fun"]';
        var t1 = setTimeout(function () {
          hideTutorialCellGuide();
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                var targetEl = document.querySelector(state.tutorial.allowedButton);
                if (targetEl) {
                  var rect = targetEl.getBoundingClientRect();
                  var guide = document.createElement('div');
                  guide.className = 'tutorial-cell-guide';
                  setGuidePosition(guide, rect, 4);
                  document.body.appendChild(guide);
                  state.tutorial.guideElement = guide;
                }
              });
            });
          });
        }, 100);
        addGuideTimeout(t1);
      },
    },
    {
      target: '#panelX',
      title: '趣味模式 - 能力面板',
      content: '已切换到<strong>趣味模式</strong>！<br><br>此时左右两侧会显示双方玩家的<strong>能力面板</strong>。每位玩家各拥有一次<strong>撤回</strong>、<strong>固定</strong>和<strong>保留</strong>能力，合理使用可大幅改变战局。',
      position: 'right',
      onEnter: function () {
        XOApp.hideModal(els.modeModal);
        els.tutorialOverlay.classList.remove('modal-mode');
        els.tutorialOverlay.classList.remove('button-interaction-mode');
        XOApp.hideTutorialCellGuide();
        XOApp.resetGame(MODE_FUN);
      },
    },
    {
      target: '#btnUndoX',
      title: '撤回能力',
      content: '<strong>撤回</strong>：可撤销自己的上一步落子，使用后次数消耗。<br><br>现在棋盘上已有一些棋子，请先点击<strong>闪烁的格子</strong>落下一枚 X 棋子，然后我们再演示撤回功能。',
      position: 'left',
      onEnter: function () {
        els.tutorialOverlay.hidden = false;
        XOApp.resetGame(MODE_FUN);
        state.history = [];
        var demoMoves = [[0, 0], [1, 0], [0, 1], [2, 0]];
        for (var i = 0; i < demoMoves.length; i++) {
          var move = demoMoves[i];
          state.history.push(window.XOGame.cloneState(state.game));
          state.game = makeMove(state.game, move[0], move[1]);
        }
        if (state.tutorial.undoStage === 1) {
          state.history.push(window.XOGame.cloneState(state.game));
          state.game = makeMove(state.game, 2, 2);
          XOApp.render();
          XOApp.showTutorialUndoGuide();
        } else {
          state.tutorial.undoStage = 0;
          state.tutorial.waitingForInteraction = true;
          state.tutorial.interactionCell = [2, 2];
          XOApp.render();
          var st3 = setTimeout(showTutorialCellGuide, 100);
          addGuideTimeout(st3);
        }
      },
    },
    {
      target: '#btnFreezeX',
      title: '固定能力',
      content: '<strong>固定</strong>：点击后选择一个空格子，对方无法在此落子，固定会在对方下一次落子后解除。<br><br>被固定的格子会显示对应玩家颜色的边框和 🔒 图标。<br><br>现在请点击<strong>闪烁的固定按钮</strong>，激活固定能力。',
      position: 'left',
      onEnter: function () {
        els.tutorialOverlay.hidden = false;
        XOApp.resetGame(MODE_FUN);
        var demoMoves = [[0, 0], [1, 0], [0, 1], [2, 0]];
        for (var i = 0; i < demoMoves.length; i++) {
          var move = demoMoves[i];
          state.game = makeMove(state.game, move[0], move[1]);
        }
        state.tutorial.freezeStage = 1;
        state.tutorial.waitingForInteraction = true;
        XOApp.render();
        var st4 = setTimeout(showTutorialFreezeBtnGuide, 100);
        addGuideTimeout(st4);
      },
    },
    {
      target: '#board',
      title: '固定能力',
      content: '固定能力已激活！<br><br>现在请点击棋盘上<strong>闪烁的格子</strong>，将该格子设为固定状态。',
      position: 'top',
      onEnter: function () {
        if (state.tutorial.freezeStage !== 2) {
          XOApp.resetGame(MODE_FUN);
          var demoMoves = [[0, 0], [1, 0], [0, 1], [2, 0]];
          for (var i = 0; i < demoMoves.length; i++) {
            var move = demoMoves[i];
            state.game = makeMove(state.game, move[0], move[1]);
          }
          state.game = window.XOGame.startFreezeSelection(state.game, 'X');
          state.freezeInitiator = 'X';
        }
        state.tutorial.freezeStage = 2;
        state.tutorial.waitingForInteraction = true;
        state.tutorial.interactionCell = [1, 1];
        XOApp.render();
        var st5 = setTimeout(showTutorialFreezeCellGuide, 100);
        addGuideTimeout(st5);
      },
    },
    {
      target: '#board',
      title: '固定效果演示',
      content: '固定成功！中间的格子 (1,1) 已被 X 方固定（显示 🔒 图标和蓝色边框）。<br><br>现在轮到 O 方落子，请先点击<strong>闪烁的固定格子</strong>（中间），试试能不能在被固定的格子落子。',
      position: 'top',
      onEnter: function () {
        if (state.tutorial.freezeStage !== 3) {
          XOApp.resetGame(MODE_FUN);
          var demoMoves = [[0, 0], [1, 0], [0, 1], [2, 0]];
          for (var i = 0; i < demoMoves.length; i++) {
            var move = demoMoves[i];
            state.game = makeMove(state.game, move[0], move[1]);
          }
          state.game = window.XOGame.startFreezeSelection(state.game, 'X');
          state.game = window.XOGame.setFreezeTarget(state.game, 1, 1, 'X');
          state.game.currentPlayer = PLAYER_O;
          state.game.waitingForFreezeTarget = false;
          state.game.freeze.active = true;
          state.game.freeze.row = 1;
          state.game.freeze.col = 1;
          state.game.freeze.owner = 'X';
          state.game.freeze.willExpire = true;
          state.freezeInitiator = null;
        }
        state.tutorial.freezeStage = 3;
        state.tutorial.waitingForInteraction = true;
        state.tutorial.interactionCell = [1, 1];
        state.tutorial.freezeTriedFrozenCell = false;
        XOApp.render();
        var st6 = setTimeout(showTutorialCellGuide, 100);
        addGuideTimeout(st6);
      },
    },
    {
      target: '#board',
      title: '固定效果演示',
      content: '没错！被固定的格子无法落子，O 方只能选择其他位置。<br><br>现在请点击<strong>闪烁的格子</strong>（右下角），让 O 方在其他位置落子，观察固定效果解除。',
      position: 'top',
      onEnter: function () {
        if (state.tutorial.freezeStage !== 4) {
          XOApp.resetGame(MODE_FUN);
          var demoMoves = [[0, 0], [1, 0], [0, 1], [2, 0]];
          for (var i = 0; i < demoMoves.length; i++) {
            var move = demoMoves[i];
            state.game = makeMove(state.game, move[0], move[1]);
          }
          state.game = window.XOGame.startFreezeSelection(state.game, 'X');
          state.game = window.XOGame.setFreezeTarget(state.game, 1, 1, 'X');
          state.game.currentPlayer = PLAYER_O;
        }
        state.tutorial.freezeStage = 4;
        state.tutorial.waitingForInteraction = true;
        state.tutorial.interactionCell = [2, 2];
        state.tutorial.animateFreezeDisappear = true;
        state.tutorial.freezeDisappearCell = [1, 1];
        XOApp.render();
        var st7 = setTimeout(showTutorialCellGuide, 100);
        addGuideTimeout(st7);
      },
    },
    {
      target: '#btnFreezeX',
      title: '取消固定 - 激活固定',
      content: '固定能力已完整演示！接下来介绍如何<strong>取消固定</strong>操作。<br><br>取消固定需要先激活固定能力，然后在选择目标格子前取消。<br><br>现在请点击<strong>闪烁的固定按钮</strong>，先激活固定能力。',
      position: 'left',
      onEnter: function () {
        XOApp.resetGame(MODE_FUN);
        var demoMoves = [[0, 0], [1, 0], [0, 1], [2, 0]];
        for (var i = 0; i < demoMoves.length; i++) {
          var move = demoMoves[i];
          state.game = makeMove(state.game, move[0], move[1]);
        }
        state.tutorial.freezeStage = 5;
        state.tutorial.waitingForInteraction = true;
        XOApp.render();
        var st8 = setTimeout(showTutorialFreezeBtnGuide, 100);
        addGuideTimeout(st8);
      },
    },
    {
      target: '#btnCancelFreeze',
      title: '取消固定',
      content: '固定能力已激活！下方出现了"取消"按钮。<br><br>取消方式有两种：<br>• 点击下方的<strong>"取消"按钮</strong><br>• 再次点击<strong>固定按钮</strong><br><br>现在请点击<strong>闪烁的"取消"按钮</strong>，取消本次固定操作。',
      position: 'bottom',
      onEnter: function () {
        if (state.tutorial.freezeStage !== 5) {
          XOApp.resetGame(MODE_FUN);
          var demoMoves = [[0, 0], [1, 0], [0, 1], [2, 0]];
          for (var i = 0; i < demoMoves.length; i++) {
            var move = demoMoves[i];
            state.game = makeMove(state.game, move[0], move[1]);
          }
          state.game = window.XOGame.startFreezeSelection(state.game, 'X');
          state.freezeInitiator = 'X';
          XOApp.render();
        }
        state.tutorial.freezeStage = 6;
        state.tutorial.waitingForInteraction = true;
        var st9 = setTimeout(XOApp.showTutorialCancelFreezeBtnGuide, 100);
        addGuideTimeout(st9);
      },
    },
    {
      target: '#btnPersistX',
      title: '保留能力',
      content: '<strong>保留</strong>：点击激活后，下一步落子的棋子将保留五个回合，不会因为后续放置新棋子而被自动移除。<br><br>这是趣味模式中最具策略性的能力，善用它可锁定胜局！<br><br>现在请点击<strong>闪烁的保留按钮</strong>，激活保留能力。',
      position: 'left',
      onEnter: function () {
        els.tutorialOverlay.hidden = false;
        XOApp.resetGame(MODE_FUN);
        state.tutorial.persistStage = 1;
        state.tutorial.waitingForInteraction = true;
        XOApp.render();
        var st10 = setTimeout(showTutorialPersistBtnGuide, 100);
        addGuideTimeout(st10);
      },
    },
    {
      target: '#board',
      title: '落下保留棋子',
      content: '保留能力已激活！<br><br>现在请点击棋盘上<strong>闪烁的格子</strong>，落下一枚带有保留效果的 X 棋子。观察该棋子不会因其他棋子被移除而消失。',
      position: 'top',
      onEnter: function () {
        if (state.tutorial.persistStage !== 2) {
          XOApp.resetGame(MODE_FUN);
          state.game = window.XOGame.usePersist(state.game, 'X');
        }
        state.tutorial.persistStage = 2;
        state.tutorial.waitingForInteraction = true;
        state.tutorial.interactionCell = [2, 0];
        els.tutorialOverlay.classList.add('interaction-mode');
        XOApp.render();
        var st11 = setTimeout(showTutorialCellGuide, 100);
        addGuideTimeout(st11);
      },
    },
    {
      target: '#btnPersistX',
      title: '取消保留 - 激活保留',
      content: '保留能力已完整演示！接下来介绍如何<strong>取消保留</strong>操作。<br><br>取消保留需要先激活保留能力，然后在落下保留棋子前取消。<br><br>现在请点击<strong>闪烁的保留按钮</strong>，先激活保留能力。',
      position: 'left',
      onEnter: function () {
        XOApp.resetGame(MODE_FUN);
        state.tutorial.persistStage = 10;
        state.tutorial.waitingForInteraction = true;
        XOApp.render();
        var st12 = setTimeout(showTutorialPersistBtnGuide, 100);
        addGuideTimeout(st12);
      },
    },
    {
      target: '#btnCancelPersist',
      title: '取消保留',
      content: '保留能力已激活！下方出现了"取消"按钮。<br><br>取消方式有两种：<br>• 点击下方的<strong>"取消"按钮</strong><br>• 再次点击<strong>保留按钮</strong><br><br>现在请点击<strong>闪烁的"取消"按钮</strong>，取消本次保留操作。',
      position: 'bottom',
      onEnter: function () {
        if (state.tutorial.persistStage !== 10) {
          XOApp.resetGame(MODE_FUN);
          state.game = window.XOGame.usePersist(state.game, 'X');
          XOApp.render();
        }
        state.tutorial.persistStage = 11;
        state.tutorial.waitingForInteraction = true;
        var st13 = setTimeout(XOApp.showTutorialCancelPersistBtnGuide, 100);
        addGuideTimeout(st13);
      },
    },
    {
      target: '#btnAI',
      title: 'AI对局',
      content: '点击此按钮可打开<strong>AI对局设置</strong>，选择与AI对战或与朋友对战。',
      position: 'bottom',
      onEnter: function () {
        state.tutorial.aiStage = 1;
        state.tutorial.waitingForInteraction = true;
        XOApp.render();
        var t2 = setTimeout(function () {
          hideTutorialCellGuide();
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                var targetEl = document.querySelector('#btnAI');
                if (targetEl) {
                  var rect = targetEl.getBoundingClientRect();
                  var guide = document.createElement('div');
                  guide.className = 'tutorial-cell-guide';
                  setGuidePosition(guide, rect, 4);
                  document.body.appendChild(guide);
                  state.tutorial.guideElement = guide;
                  state.tutorial.allowedButton = '#btnAI';
                }
              });
            });
          });
        }, 100);
        addGuideTimeout(t2);
      },
    },
    {
      target: null,
      title: 'AI对局设置',
      content: '这里可以设置AI对局的各项选项：<br><br><strong>对局类型</strong>：<br>• <strong>人人对局</strong>：两位玩家轮流操作<br>• <strong>人机对局</strong>：与AI对战<br><br>现在默认显示的是<strong>"人人对局"</strong>，请点击<strong>闪烁的"人机对局"按钮</strong>，查看与AI对战的相关设置。',
      position: 'center',
      onEnter: function () {
        XOApp.showModal(els.aiModal);
        els.tutorialOverlay.classList.add('modal-mode');
        els.tutorialOverlay.classList.add('button-interaction-mode');
        state.tutorial.aiStage = 2;
        state.tutorial.waitingForInteraction = true;
        state.tutorial.allowedButton = '.option-btn[data-ai-setting="gameMode"][data-value="pve"]';
        var t3 = setTimeout(function () {
          hideTutorialCellGuide();
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                var targetEl = document.querySelector(state.tutorial.allowedButton);
                if (targetEl) {
                  var rect = targetEl.getBoundingClientRect();
                  var guide = document.createElement('div');
                  guide.className = 'tutorial-cell-guide';
                  setGuidePosition(guide, rect, 4);
                  document.body.appendChild(guide);
                  state.tutorial.guideElement = guide;
                }
              });
            });
          });
        }, 100);
        addGuideTimeout(t3);
      },
    },
    {
      target: null,
      title: 'AI对局设置 - 人机对局',
      content: '切换到<strong>人机对局</strong>后，下方会显示额外的设置选项：<br><br><strong>AI难度</strong>：<span style="display:inline-block;margin-left:8px;">初级 · 中级 · 高级</span>',
      position: 'center',
      onEnter: function () {
        XOApp.showModal(els.aiModal);
        els.tutorialOverlay.classList.add('modal-mode');
        els.tutorialOverlay.classList.remove('button-interaction-mode');
        XOApp.hideTutorialCellGuide();
        state.tutorial.aiStage = 3;
        state.tutorial.waitingForInteraction = false;
        state.tutorial.allowedButton = null;
        state.tutorial.manualPositioning = true;
        var curStep = TUTORIAL_STEPS[state.tutorial.currentStep];
        els.tutorialContent.innerHTML = '<h3 style="margin:0 0 8px;font-size:16px;">' + curStep.title + '</h3><p style="margin:0;">' + curStep.content + '</p>';
        els.tutorialTooltip.style.transition = 'none';
        els.tutorialTooltip.style.visibility = 'hidden';
        els.tutorialTooltip.style.padding = '14px 18px';
        els.tutorialTooltip.style.fontSize = '14px';
        els.tutorialTooltip.style.lineHeight = '1.5';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            var modalDialog = els.aiModal.querySelector('.modal-dialog');
            if (!modalDialog) {
              els.tutorialTooltip.style.visibility = '';
              els.tutorialTooltip.style.transition = '';
              state.tutorial.manualPositioning = false;
              return;
            }
            var modalRect = modalDialog.getBoundingClientRect();
            var tooltipWidth = Math.max(modalRect.width - 16, Math.min(window.innerWidth - 32, 480));
            els.tutorialTooltip.style.width = tooltipWidth + 'px';
            var tooltipRect = els.tutorialTooltip.getBoundingClientRect();
            var tooltipHeight = tooltipRect.height;
            var leftPos = modalRect.left + modalRect.width / 2 - tooltipWidth / 2;
            if (leftPos < 16) leftPos = 16;
            if (leftPos + tooltipWidth > window.innerWidth - 16) {
              leftPos = window.innerWidth - tooltipWidth - 16;
            }
            var topPos = modalRect.top - tooltipHeight - 12;
            if (topPos < 16) {
              topPos = 16;
            }
            els.tutorialTooltip.className = 'tutorial-tooltip arrow-bottom';
            els.tutorialTooltip.style.left = leftPos + 'px';
            els.tutorialTooltip.style.top = topPos + 'px';
            els.tutorialTooltip.style.transform = 'none';
            els.tutorialTooltip.style.visibility = '';
            requestAnimationFrame(function () {
              els.tutorialTooltip.style.transition = '';
              state.tutorial.manualPositioning = false;
            });
          });
        });
      },
      onExit: function () {
        els.tutorialTooltip.style.padding = '';
        els.tutorialTooltip.style.fontSize = '';
        els.tutorialTooltip.style.lineHeight = '';
        els.tutorialTooltip.style.width = '';
      },
    },
    {
      target: '#btnHelp',
      title: '游戏帮助',
      content: '点击此按钮可随时查看<strong>游戏帮助</strong>，了解完整的游戏规则和玩法说明。<br><br>现在请点击<strong>闪烁的帮助按钮</strong>，打开帮助弹窗查看。',
      position: 'bottom',
      onEnter: function () {
        state.tutorial.helpStage = 1;
        state.tutorial.waitingForInteraction = true;
        XOApp.render();
        var st14 = setTimeout(showTutorialHelpBtnGuide, 100);
        addGuideTimeout(st14);
      },
    },
    {
      target: null,
      title: '帮助弹窗',
      content: '这里可以查看<strong>完整的游戏规则和玩法说明</strong>，支持翻页浏览。<br><br>浏览完毕后，关闭弹窗继续教程。',
      position: 'center',
      onEnter: function () {
        XOApp.showModal(els.helpModal);
        els.tutorialOverlay.classList.add('modal-mode');
        state.tutorial.helpStage = 2;
        state.tutorial.waitingForInteraction = false;
        state.tutorial.manualPositioning = true;
        var curStep = TUTORIAL_STEPS[state.tutorial.currentStep];
        els.tutorialContent.innerHTML = '<h3 style="margin:0 0 8px;font-size:16px;">' + curStep.title + '</h3><p style="margin:0;">' + curStep.content + '</p>';
        els.tutorialTooltip.style.transition = 'none';
        els.tutorialTooltip.style.visibility = 'hidden';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            var modalDialog = els.helpModal.querySelector('.modal-dialog');
            if (!modalDialog) {
              els.tutorialTooltip.style.visibility = '';
              els.tutorialTooltip.style.transition = '';
              state.tutorial.manualPositioning = false;
              return;
            }
            var modalRect = modalDialog.getBoundingClientRect();
            var tooltipWidth = Math.max(modalRect.width - 16, Math.min(window.innerWidth - 32, 480));
            els.tutorialTooltip.style.width = tooltipWidth + 'px';
            var tooltipRect = els.tutorialTooltip.getBoundingClientRect();
            var tooltipHeight = tooltipRect.height;
            var leftPos = modalRect.left + modalRect.width / 2 - tooltipWidth / 2;
            if (leftPos < 16) leftPos = 16;
            if (leftPos + tooltipWidth > window.innerWidth - 16) {
              leftPos = window.innerWidth - tooltipWidth - 16;
            }
            var topPos = modalRect.top - tooltipHeight - 12;
            if (topPos < 16) {
              topPos = 16;
            }
            els.tutorialTooltip.className = 'tutorial-tooltip arrow-bottom';
            els.tutorialTooltip.style.left = leftPos + 'px';
            els.tutorialTooltip.style.top = topPos + 'px';
            els.tutorialTooltip.style.transform = 'none';
            els.tutorialTooltip.style.visibility = '';
            requestAnimationFrame(function () {
              els.tutorialTooltip.style.transition = '';
              state.tutorial.manualPositioning = false;
            });
          });
        });
      },
    },
    {
      target: '#btnSettings',
      title: '游戏设置',
      content: '点击此按钮可打开<strong>设置</strong>，调整棋盘大小、棋子大小和主题配色，也可以在这里重新查看本教程。<br><br>现在请点击<strong>闪烁的设置按钮</strong>，打开设置弹窗查看。',
      position: 'bottom',
      onEnter: function () {
        state.tutorial.settingsStage = 1;
        state.tutorial.waitingForInteraction = true;
        XOApp.render();
        var st15 = setTimeout(showTutorialSettingsBtnGuide, 100);
        addGuideTimeout(st15);
      },
    },
    {
      target: null,
      title: '设置弹窗',
      content: '这里可以调整<strong>棋盘大小、棋子大小和主题配色</strong>，也可以重新查看新手教程。<br><br>点击"下一步"我们来了解具体的设置功能。',
      position: 'center',
      onEnter: function () {
        XOApp.showModal(els.settingsModal);
        els.tutorialOverlay.classList.add('modal-mode');
        state.tutorial.settingsStage = 2;
        state.tutorial.waitingForInteraction = false;
        var settingsDialog = els.settingsModal.querySelector('.modal-dialog');
        if (settingsDialog) {
          settingsDialog.classList.remove('settings-peek-mode');
        }
      },
    },
    {
      target: '.settings-page[data-settings-page="basic"]',
      title: '基本设置 - 棋盘大小',
      content: '这里有两个设置标签页。当前是<strong>基本设置</strong>页面。<br><br><strong>棋盘大小</strong>：可选择"标准款"或"大款"，大款棋盘更适合大屏设备。<br><br>请点击<strong>"大款"</strong>按钮试试效果，观察棋盘变大。',
      position: 'center',
      onEnter: function () {
        XOApp.showModal(els.settingsModal);
        els.tutorialOverlay.classList.add('modal-mode');
        els.tutorialOverlay.classList.add('button-interaction-mode');
        state.tutorial.settingsStage = 3;
        state.tutorial.waitingForInteraction = true;
        state.tutorial.allowedButton = '.option-btn[data-setting="boardSize"][data-value="large"]';
        var settingsDialog = els.settingsModal.querySelector('.modal-dialog');
        if (settingsDialog) {
          settingsDialog.classList.remove('settings-peek-mode');
        }
        var ts1 = setTimeout(function () {
          if (!XOApp.collapseState['board-settings']) {
            XOApp.collapseState['board-settings'] = true;
            localStorage.setItem('xando-collapse-board-settings', 'false');
            XOApp.applyCollapseState();
          }
        }, 50);
        addGuideTimeout(ts1);
        var ts2 = setTimeout(function () {
          var targetEl = document.querySelector(state.tutorial.allowedButton);
          if (targetEl) {
            var settingsPage = document.querySelector('.settings-page[data-settings-page="basic"]');
            if (settingsPage) {
              var targetRect = targetEl.getBoundingClientRect();
              var pageRect = settingsPage.getBoundingClientRect();
              if (targetRect.bottom > pageRect.bottom || targetRect.top < pageRect.top) {
                targetEl.scrollIntoView({ behavior: 'auto', block: 'center' });
              }
            }
          }
        }, 150);
        addGuideTimeout(ts2);
        var ts3 = setTimeout(function () {
          hideTutorialCellGuide();
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                var targetEl = document.querySelector(state.tutorial.allowedButton);
                if (targetEl) {
                  var rect = targetEl.getBoundingClientRect();
                  var guide = document.createElement('div');
                  guide.className = 'tutorial-cell-guide';
                  setGuidePosition(guide, rect, 4);
                  document.body.appendChild(guide);
                  state.tutorial.guideElement = guide;
                }
              });
            });
          });
        }, 400);
        addGuideTimeout(ts3);
      },
    },
    {
      target: '.settings-page[data-settings-page="basic"]',
      title: '基本设置 - 棋子大小',
      content: '棋盘变大了！现在来试试<strong>棋子大小</strong>设置。<br><br>棋子大小有三个选项：<br>• <strong>小（33%）</strong>：小巧精致<br>• <strong>标准（50%）</strong>：默认大小<br>• <strong>大（66%）</strong>：醒目霸气<br><br>请点击<strong>"大（66%）"</strong>按钮，观察棋子变大。',
      position: 'center',
      onEnter: function () {
        XOApp.showModal(els.settingsModal);
        els.tutorialOverlay.classList.add('modal-mode');
        els.tutorialOverlay.classList.add('button-interaction-mode');
        state.tutorial.settingsStage = 4;
        state.tutorial.waitingForInteraction = true;
        state.tutorial.allowedButton = '.option-btn[data-setting="pieceSize"][data-value="large"]';
        XOApp.hideTutorialCellGuide();
        var settingsDialog = els.settingsModal.querySelector('.modal-dialog');
        if (settingsDialog) {
          settingsDialog.classList.remove('settings-peek-mode');
        }
        var ts4 = setTimeout(function () {
          if (!XOApp.collapseState['board-settings']) {
            XOApp.collapseState['board-settings'] = true;
            localStorage.setItem('xando-collapse-board-settings', 'false');
            XOApp.applyCollapseState();
          }
        }, 50);
        addGuideTimeout(ts4);
        var ts5 = setTimeout(function () {
          var targetEl = document.querySelector(state.tutorial.allowedButton);
          if (targetEl) {
            var settingsPage = document.querySelector('.settings-page[data-settings-page="basic"]');
            if (settingsPage) {
              var targetRect = targetEl.getBoundingClientRect();
              var pageRect = settingsPage.getBoundingClientRect();
              if (targetRect.bottom > pageRect.bottom || targetRect.top < pageRect.top) {
                targetEl.scrollIntoView({ behavior: 'auto', block: 'center' });
              }
            }
          }
        }, 150);
        addGuideTimeout(ts5);
        var ts6 = setTimeout(function () {
          hideTutorialCellGuide();
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                var targetEl = document.querySelector(state.tutorial.allowedButton);
                if (targetEl) {
                  var rect = targetEl.getBoundingClientRect();
                  var guide = document.createElement('div');
                  guide.className = 'tutorial-cell-guide';
                  setGuidePosition(guide, rect, 4);
                  document.body.appendChild(guide);
                  state.tutorial.guideElement = guide;
                }
              });
            });
          });
        }, 400);
        addGuideTimeout(ts6);
      },
    },
    {
      target: '.settings-tab[data-settings-tab="theme"]',
      title: '主题选择',
      content: '基本设置了解完毕！现在来看看<strong>主题选择</strong>。<br><br>请点击<strong>"主题选择"</strong>标签页，查看丰富的主题配色。',
      position: 'center',
      onEnter: function () {
        XOApp.showModal(els.settingsModal);
        els.tutorialOverlay.classList.add('modal-mode');
        els.tutorialOverlay.classList.add('button-interaction-mode');
        state.tutorial.settingsStage = 5;
        state.tutorial.waitingForInteraction = true;
        state.tutorial.allowedButton = '.settings-tab[data-settings-tab="theme"]';
        XOApp.hideTutorialCellGuide();
        var settingsDialog = els.settingsModal.querySelector('.modal-dialog');
        if (settingsDialog) {
          settingsDialog.classList.remove('settings-peek-mode');
        }
        var ts7 = setTimeout(function () {
          hideTutorialCellGuide();
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                var targetEl = document.querySelector(state.tutorial.allowedButton);
                if (targetEl) {
                  var rect = targetEl.getBoundingClientRect();
                  var guide = document.createElement('div');
                  guide.className = 'tutorial-cell-guide';
                  setGuidePosition(guide, rect, 4);
                  document.body.appendChild(guide);
                  state.tutorial.guideElement = guide;
                }
              });
            });
          });
        }, 100);
        addGuideTimeout(ts7);
      },
    },
    {
      target: '.settings-page[data-settings-page="theme"]',
      title: '主题配色',
      content: '哇！有 <strong>7 种精美主题</strong>可选：<br>• <strong>经典</strong>：清爽白底<br>• <strong>橘子海</strong>：暖橙渐变<br>• <strong>日落</strong>：火红夕阳<br>• <strong>深海</strong>：蓝绿调<br>• <strong>森林</strong>：清新绿意<br>• <strong>午夜</strong>：暗色科幻<br>• <strong>糖果</strong>：粉色甜美<br><br>请点击<strong>"橘子海"</strong>主题，感受温暖的氛围！',
      position: 'center',
      onEnter: function () {
        XOApp.showModal(els.settingsModal);
        els.tutorialOverlay.classList.add('modal-mode');
        els.tutorialOverlay.classList.add('button-interaction-mode');
        state.tutorial.settingsStage = 6;
        state.tutorial.waitingForInteraction = true;
        state.tutorial.allowedButton = '.option-btn[data-setting="theme"][data-value="orange-sea"]';
        XOApp.hideTutorialCellGuide();
        var settingsDialog = els.settingsModal.querySelector('.modal-dialog');
        if (settingsDialog) {
          settingsDialog.classList.remove('settings-peek-mode');
        }
        var ts8 = setTimeout(function () {
          var targetEl = document.querySelector(state.tutorial.allowedButton);
          if (targetEl) {
            var settingsPage = document.querySelector('.settings-page[data-settings-page="theme"]');
            if (settingsPage) {
              var targetRect = targetEl.getBoundingClientRect();
              var pageRect = settingsPage.getBoundingClientRect();
              if (targetRect.bottom > pageRect.bottom || targetRect.top < pageRect.top) {
                targetEl.scrollIntoView({ behavior: 'auto', block: 'center' });
              }
            }
          }
        }, 150);
        addGuideTimeout(ts8);
        var ts9 = setTimeout(function () {
          hideTutorialCellGuide();
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                var targetEl = document.querySelector(state.tutorial.allowedButton);
                if (targetEl) {
                  var rect = targetEl.getBoundingClientRect();
                  var guide = document.createElement('div');
                  guide.className = 'tutorial-cell-guide';
                  setGuidePosition(guide, rect, 4);
                  document.body.appendChild(guide);
                  state.tutorial.guideElement = guide;
                }
              });
            });
          });
        }, 400);
        addGuideTimeout(ts9);
      },
    },
    {
      target: '#btnReset',
      title: '重新开始',
      content: '主题是不是很漂亮？点击"下一步"我们将恢复您原来的设置并切换回常规模式，准备正式开始。',
      position: 'top',
      onEnter: function () {
        XOApp.hideModal(els.settingsModal);
        els.tutorialOverlay.classList.remove('modal-mode');
        els.tutorialOverlay.classList.remove('button-interaction-mode');
        state.tutorial.settingsStage = 0;
        state.tutorial.waitingForInteraction = false;
        var settingsDialog = els.settingsModal.querySelector('.modal-dialog');
        if (settingsDialog) {
          settingsDialog.classList.remove('settings-peek-mode');
        }
        XOApp.hideTutorialCellGuide();
        if (state.tutorial.preTutorialSettings) {
          state.settings.boardSize = state.tutorial.preTutorialSettings.boardSize;
          state.settings.pieceSize = state.tutorial.preTutorialSettings.pieceSize;
          state.settings.theme = state.tutorial.preTutorialSettings.theme;
        } else {
          state.settings.boardSize = 'standard';
          state.settings.pieceSize = 'standard';
          state.settings.theme = 'classic';
        }
        XOApp.applyBoardSize();
        XOApp.applyPieceSize();
        XOApp.applyTheme();
      },
    },
    {
      target: null,
      title: '准备就绪！',
      content: '教程已完成，已切换回<strong>常规模式</strong>。<br><br>💡 小贴士：由于棋子会随时间自动消失，防守往往比进攻更重要，注意观察棋子的新旧顺序。<br><br>祝您游玩愉快！',
      position: 'center',
      onEnter: function () {
        XOApp.resetGame(MODE_NORMAL);
      },
    },
  ];

  function renderTutorial() {
    var step = TUTORIAL_STEPS[state.tutorial.currentStep];

    if (!(state.tutorial.helpStage === 2 && state.tutorial.helpTooltipHidden)) {
      state.tutorial.helpTooltipHidden = false;
      els.tutorialTooltip.style.visibility = '';
      els.tutorialTooltip.style.opacity = '';
      if (state.tutorial.guideElement) {
        state.tutorial.guideElement.style.visibility = '';
        state.tutorial.guideElement.style.opacity = '';
      }
    }

    var isManual = !!state.tutorial.manualPositioning;

    els.tutorialOverlay.classList.remove('button-interaction-mode');

    if (typeof step.onEnter === 'function' && state.tutorial.lastOnEnterStep !== state.tutorial.currentStep) {
      state.tutorial.lastOnEnterStep = state.tutorial.currentStep;
      step.onEnter();
    }

    if (state.tutorial.manualPositioning) {
      els.tutorialPrev.hidden = state.tutorial.currentStep === 0;
      if (state.tutorial.currentStep === state.tutorial.totalSteps - 1) {
        els.tutorialNext.textContent = '开始游戏';
      } else {
        els.tutorialNext.textContent = '下一步';
      }
      return;
    }

    els.tutorialOverlay.classList.toggle('interaction-mode', state.tutorial.waitingForInteraction && !!state.tutorial.interactionCell);

    els.tutorialContent.innerHTML = '<h3 style="margin:0 0 8px;font-size:16px;">' + step.title + '</h3><p style="margin:0;">' + step.content + '</p>';

    els.tutorialPrev.hidden = state.tutorial.currentStep === 0;

    if (state.tutorial.currentStep === state.tutorial.totalSteps - 1) {
      els.tutorialNext.textContent = '开始游戏';
    } else {
      els.tutorialNext.textContent = '下一步';
    }

    if (step.target && !els.tutorialOverlay.classList.contains('modal-mode')) {
      var targetEl = document.querySelector(step.target);
      var rect, targetPosition;
      var tooltipExtraGap = 0;
      var forcePosition = false;
      var isPersistDemo = state.tutorial.persistStage >= 3 && state.tutorial.persistStage <= 8 && state.tutorial.interactionCell;
      if (step.target === '#btnUndoX' && state.tutorial.undoStage === 0 && state.tutorial.interactionCell) {
        var cellRow = state.tutorial.interactionCell[0];
        var cellCol = state.tutorial.interactionCell[1];
        var cell = document.querySelector('.cell[data-row="' + cellRow + '"][data-col="' + cellCol + '"]');
        if (cell) {
          rect = cell.getBoundingClientRect();
          targetPosition = window.innerWidth <= 800 ? 'bottom' : 'right';
          targetEl = cell;
          tooltipExtraGap = window.innerWidth <= 800 ? 20 : 20;
          forcePosition = false;
        } else if (targetEl) {
          rect = targetEl.getBoundingClientRect();
          targetPosition = step.position;
        }
      } else if (isPersistDemo) {
        if (window.innerWidth <= 800) {
          var persistBoardEl = document.querySelector('#board');
          var pRow = state.tutorial.interactionCell[0];
          if (persistBoardEl) {
            var pBoardRect = persistBoardEl.getBoundingClientRect();
            var spaceTop = pBoardRect.top;
            var spaceBottom = window.innerHeight - pBoardRect.bottom;
            var estTooltipH = 220;
            var safeMargin = 32;
            var allowTop = (pRow !== 0) && (spaceTop >= estTooltipH + safeMargin);
            var allowBottom = (pRow !== 2) && (spaceBottom >= estTooltipH + safeMargin);
            var finalPos;
            if (allowTop && allowBottom) {
              finalPos = spaceTop >= spaceBottom ? 'top' : 'bottom';
            } else if (allowTop) {
              finalPos = 'top';
            } else if (allowBottom) {
              finalPos = 'bottom';
            } else {
              var fallbackAllowTop = pRow !== 0;
              var fallbackAllowBottom = pRow !== 2;
              if (fallbackAllowTop && fallbackAllowBottom) {
                finalPos = spaceTop >= spaceBottom ? 'top' : 'bottom';
              } else if (fallbackAllowTop) {
                finalPos = 'top';
              } else if (fallbackAllowBottom) {
                finalPos = 'bottom';
              } else {
                finalPos = spaceTop >= spaceBottom ? 'top' : 'bottom';
              }
            }
            rect = pBoardRect;
            targetPosition = finalPos;
            targetEl = persistBoardEl;
            tooltipExtraGap = 16;
            forcePosition = false;
          }
        } else {
          var pCellRow = state.tutorial.interactionCell[0];
          var pCellCol = state.tutorial.interactionCell[1];
          var pCell = document.querySelector('.cell[data-row="' + pCellRow + '"][data-col="' + pCellCol + '"]');
          if (pCell) {
            rect = pCell.getBoundingClientRect();
            targetPosition = 'right';
            targetEl = pCell;
            tooltipExtraGap = 20;
            forcePosition = false;
          } else if (targetEl) {
            rect = targetEl.getBoundingClientRect();
            targetPosition = step.position;
          }
        }
      } else if (targetEl) {
        rect = targetEl.getBoundingClientRect();
        targetPosition = step.position;
      }
      if (state.tutorial.currentStep === 3 && window.innerWidth <= 800 && state.tutorial._dynamicStepMovedDown) {
        targetPosition = 'bottom';
        forcePosition = true;
        tooltipExtraGap = Math.max(tooltipExtraGap, 20);
      }
      if (rect) {
        var padding = 8;
        if (targetEl && targetEl.classList && targetEl.classList.contains('cell')) {
          els.tutorialHighlight.style.display = 'none';
        } else {
          els.tutorialHighlight.style.display = 'block';
          els.tutorialHighlight.style.left = (rect.left - padding) + 'px';
          els.tutorialHighlight.style.top = (rect.top - padding) + 'px';
          els.tutorialHighlight.style.width = (rect.width + padding * 2) + 'px';
          els.tutorialHighlight.style.height = (rect.height + padding * 2) + 'px';
        }
        positionTutorialTooltip(rect, targetPosition, targetEl, forcePosition, tooltipExtraGap);
      }
    } else {
      els.tutorialHighlight.style.display = 'none';
      if (els.tutorialOverlay.classList.contains('modal-mode')) {
        var modalDialog = null;
        if (state.tutorial.helpStage === 2) {
          modalDialog = els.helpModal.querySelector('.modal-dialog');
        } else if (state.tutorial.settingsStage >= 2 && state.tutorial.settingsStage <= 6) {
          modalDialog = els.settingsModal.querySelector('.modal-dialog');
        } else if (state.tutorial.modeStage === 2) {
          modalDialog = els.modeModal.querySelector('.modal-dialog');
        } else if (state.tutorial.aiStage === 2 || state.tutorial.aiStage === 3) {
          modalDialog = els.aiModal.querySelector('.modal-dialog');
        }
        if (modalDialog) {
          var modalRect = modalDialog.getBoundingClientRect();
          var sideTooltipWidth = 240;
          var sideTooltipHeight = 160;
          var sideGap = 16;
          if (state.tutorial.modeStage === 2) {
            sideTooltipWidth = Math.min(window.innerWidth - 32, 320);
            sideTooltipHeight = 110;
          }
          var sideLeft = modalRect.left - sideTooltipWidth - sideGap;
          var sideArrow = 'arrow-right';
          var isNarrowScreen = window.innerWidth < sideTooltipWidth * 2 + sideGap * 2 + 100 || state.tutorial.modeStage === 2;
          var useVerticalPosition = false;
          if (sideLeft < 16) {
            sideLeft = modalRect.right + sideGap;
            sideArrow = 'arrow-left';
            if (sideLeft + sideTooltipWidth > window.innerWidth - 16) {
              useVerticalPosition = true;
            }
          }
          if (isNarrowScreen) {
            useVerticalPosition = true;
          }
          if (useVerticalPosition && state.tutorial.modeStage === 2) {
            var arrowSize = 6;
            var vertLeft = modalRect.left + modalRect.width / 2 - sideTooltipWidth / 2;
            if (vertLeft < 16) vertLeft = 16;
            if (vertLeft + sideTooltipWidth > window.innerWidth - 16) {
              vertLeft = window.innerWidth - sideTooltipWidth - 16;
            }
            els.tutorialTooltip.style.transition = 'none';
            els.tutorialTooltip.style.width = sideTooltipWidth + 'px';
            els.tutorialTooltip.style.left = vertLeft + 'px';
            els.tutorialTooltip.style.visibility = 'hidden';
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                var curFunTile = document.querySelector('.mode-tile[data-mode="fun"]');
                var curModalDialog = els.modeModal.querySelector('.modal-dialog');
                if (!curModalDialog) {
                  els.tutorialTooltip.style.visibility = '';
                  els.tutorialTooltip.style.transition = '';
                  return;
                }
                var curModalRect = curModalDialog.getBoundingClientRect();
                var curTooltipRect = els.tutorialTooltip.getBoundingClientRect();
                var curTooltipHeight = curTooltipRect.height;
                var curTooltipWidth = curTooltipRect.width || sideTooltipWidth;
                var curLeft = curModalRect.left + curModalRect.width / 2 - curTooltipWidth / 2;
                if (curLeft < 16) curLeft = 16;
                if (curLeft + curTooltipWidth > window.innerWidth - 16) {
                  curLeft = window.innerWidth - curTooltipWidth - 16;
                }
                var curArrow = 'arrow-bottom';
                var targetTop;
                var extraGap = 8;
                if (curFunTile) {
                  var curFunRect = curFunTile.getBoundingClientRect();
                  targetTop = curFunRect.top - curTooltipHeight - arrowSize - extraGap;
                  var arrowOffsetX = (curFunRect.left + curFunRect.width / 2) - curLeft - 6;
                  if (arrowOffsetX < 24) arrowOffsetX = 24;
                  if (arrowOffsetX > curTooltipWidth - 24) arrowOffsetX = curTooltipWidth - 24;
                  els.tutorialTooltip.style.setProperty('--arrow-offset-x', arrowOffsetX + 'px');
                } else {
                  targetTop = curModalRect.top - curTooltipHeight - arrowSize - extraGap;
                  els.tutorialTooltip.style.setProperty('--arrow-offset-x', (curTooltipWidth / 2) + 'px');
                }
                if (targetTop < 16) {
                  if (curFunTile) {
                    var curFunRect2 = curFunTile.getBoundingClientRect();
                    targetTop = curFunRect2.bottom + arrowSize + extraGap;
                  } else {
                    targetTop = curModalRect.bottom + arrowSize + extraGap;
                  }
                  curArrow = 'arrow-top';
                }
                if (targetTop + curTooltipHeight > window.innerHeight - 16) {
                  targetTop = window.innerHeight - curTooltipHeight - 16;
                }
                els.tutorialTooltip.className = 'tutorial-tooltip ' + curArrow;
                els.tutorialTooltip.style.left = curLeft + 'px';
                els.tutorialTooltip.style.top = targetTop + 'px';
                els.tutorialTooltip.style.transform = 'none';
                els.tutorialTooltip.style.visibility = '';
                requestAnimationFrame(function () {
                  els.tutorialTooltip.style.transition = '';
                });
              });
            });
          }
          if (!useVerticalPosition) {
            var sideTop;
            if (state.tutorial.modeStage === 2) {
              var funModeTile = document.querySelector('.mode-tile[data-mode="fun"]');
              if (funModeTile) {
                var funTileRect = funModeTile.getBoundingClientRect();
                sideTop = funTileRect.top + funTileRect.height / 2 - sideTooltipHeight / 2;
              } else {
                sideTop = modalRect.top + modalRect.height / 2 - sideTooltipHeight / 2;
              }
            } else if (state.tutorial.aiStage === 2 || state.tutorial.aiStage === 3) {
              sideTooltipHeight = 260;
              sideTooltipWidth = 260;
              sideTop = modalRect.top + modalRect.height / 2 - sideTooltipHeight / 2;
            } else {
              sideTop = modalRect.top + modalRect.height / 2 - sideTooltipHeight / 2;
            }
            if (sideTop < 16) sideTop = 16;
            if (sideTop + sideTooltipHeight > window.innerHeight - 16) sideTop = window.innerHeight - sideTooltipHeight - 16;
            els.tutorialTooltip.className = 'tutorial-tooltip ' + sideArrow;
            els.tutorialTooltip.style.width = sideTooltipWidth + 'px';
            els.tutorialTooltip.style.left = sideLeft + 'px';
            els.tutorialTooltip.style.top = sideTop + 'px';
            els.tutorialTooltip.style.transform = 'none';
          }
        } else {
          var targetEl = document.querySelector(step.target);
          if (targetEl) {
            var rect = targetEl.getBoundingClientRect();
            var padding = 8;
            els.tutorialHighlight.style.display = 'block';
            els.tutorialHighlight.style.left = (rect.left - padding) + 'px';
            els.tutorialHighlight.style.top = (rect.top - padding) + 'px';
            els.tutorialHighlight.style.width = (rect.width + padding * 2) + 'px';
            els.tutorialHighlight.style.height = (rect.height + padding * 2) + 'px';
            positionTutorialTooltip(rect, step.position);
          } else {
            els.tutorialTooltip.style.left = '50%';
            els.tutorialTooltip.style.top = '50%';
            els.tutorialTooltip.style.transform = 'translate(-50%, -50%)';
            els.tutorialTooltip.style.width = '';
            els.tutorialTooltip.className = 'tutorial-tooltip no-arrow';
          }
        }
      } else {
        els.tutorialTooltip.style.left = '50%';
        els.tutorialTooltip.style.top = '50%';
        els.tutorialTooltip.style.transform = 'translate(-50%, -50%)';
        els.tutorialTooltip.style.width = '';
        els.tutorialTooltip.className = 'tutorial-tooltip no-arrow';
      }
    }
  }

  function tutorialNext() {
    if (state.tutorial.currentStep >= state.tutorial.totalSteps - 1) {
      endTutorial();
      return;
    }
    if (state.tutorial.pendingAutoAdvance) {
      clearTimeout(state.tutorial.pendingAutoAdvance);
      state.tutorial.pendingAutoAdvance = null;
    }
    if (state.tutorial.waitingForInteraction) {
      if (state.tutorial.interactionCell) {
        XOApp.handleCellClick(state.tutorial.interactionCell[0], state.tutorial.interactionCell[1]);
        return;
      }
      if (state.tutorial.allowedButton) {
        var btn = document.querySelector(state.tutorial.allowedButton);
        if (btn) btn.click();
        return;
      }
    }
    if (state.tutorial.persistStage === 9) {
      state.tutorial.persistStage = 0;
      state.tutorial.persistStepIndex++;
      if (state.tutorial.persistAutoNextOMove) {
        state.tutorial.persistAutoNextOMove();
      }
      return;
    }
    if (state.tutorial.helpStage === 2) {
      state.tutorial.helpStage = 0;
      XOApp.hideModal(els.helpModal);
      els.tutorialOverlay.classList.remove('modal-mode');
    }
    if (state.tutorial.settingsStage === 2) {
      state.tutorial.settingsStage = 0;
      XOApp.hideModal(els.settingsModal);
      els.tutorialOverlay.classList.remove('modal-mode');
    }
    if (state.tutorial.modeStage === 2) {
      state.tutorial.modeStage = 0;
      XOApp.hideModal(els.modeModal);
      els.tutorialOverlay.classList.remove('modal-mode');
    }
    if (state.tutorial.aiStage === 3) {
      state.tutorial.aiStage = 0;
      XOApp.hideModal(els.aiModal);
      els.tutorialOverlay.classList.remove('modal-mode');
      els.tutorialOverlay.classList.remove('button-interaction-mode');
    }
    var curStep = TUTORIAL_STEPS[state.tutorial.currentStep];
    if (curStep && typeof curStep.onExit === 'function') {
      curStep.onExit();
    }
    state.tutorial.currentStep++;
    state.tutorial.manualPositioning = false;
    renderTutorial();
  }

  function tutorialPrev() {
    if (state.tutorial.currentStep > 0) {
      if (state.tutorial.pendingAutoAdvance) {
        clearTimeout(state.tutorial.pendingAutoAdvance);
        state.tutorial.pendingAutoAdvance = null;
      }
      state.tutorial.waitingForInteraction = false;
      state.tutorial.interactionCell = null;
      state.tutorial.isWinStep = false;
      state.tutorial.animateDisappear = false;
      state.tutorial.disappearCell = null;
      state.tutorial.freezeCell = null;
      state.tutorial.animateFreezeDisappear = false;
      state.tutorial.freezeDisappearCell = null;
      state.tutorial.persistCell = null;
      state.tutorial.animatePersistDisappear = false;
      state.tutorial.persistDisappearCell = null;
      state.tutorial.persistSecondDisappearCell = null;
      state.tutorial.persistStepIndex = 0;
      state.tutorial.persistAutoNextOMove = null;
      state.tutorial.allowedButton = null;
      state.tutorial.freezeTriedFrozenCell = false;
      state.tutorial.helpStage = 0;
      state.tutorial.settingsStage = 0;
      state.tutorial.modeStage = 0;
      state.tutorial.aiStage = 0;
      state.tutorial.undoStage = 0;
      state.tutorial.freezeStage = 0;
      state.tutorial.persistStage = 0;
      state.tutorial.manualPositioning = false;
      state.tutorial._dynamicStepMovedDown = false;
      hideTutorialCellGuide();
      els.tutorialOverlay.classList.remove('interaction-mode');
      els.tutorialOverlay.classList.remove('modal-mode');
      els.tutorialOverlay.classList.remove('button-interaction-mode');
      XOApp.hideModal(els.helpModal);
      XOApp.hideModal(els.settingsModal);
      XOApp.hideModal(els.modeModal);
      XOApp.hideModal(els.aiModal);
      var prevStep = TUTORIAL_STEPS[state.tutorial.currentStep];
      if (prevStep && typeof prevStep.onExit === 'function') {
        prevStep.onExit();
      }
      state.tutorial.currentStep--;
      renderTutorial();
    }
  }

  function endTutorial() {
    if (state.tutorial.pendingAutoAdvance) {
      clearTimeout(state.tutorial.pendingAutoAdvance);
      state.tutorial.pendingAutoAdvance = null;
    }
    state.tutorial.active = false;
    state.tutorial.waitingForInteraction = false;
    state.tutorial.interactionCell = null;
    state.tutorial.isWinStep = false;
    state.tutorial.pausedForWinModal = false;
    state.tutorial.undoStage = 0;
    state.tutorial.animateDisappear = false;
    state.tutorial.disappearCell = null;
    state.tutorial.freezeStage = 0;
    state.tutorial.freezeCell = null;
    state.tutorial.animateFreezeDisappear = false;
    state.tutorial.freezeDisappearCell = null;
    state.tutorial.persistStage = 0;
    state.tutorial.persistCell = null;
    state.tutorial.animatePersistDisappear = false;
    state.tutorial.persistDisappearCell = null;
    state.tutorial.persistSecondDisappearCell = null;
    state.tutorial.allowedButton = null;
    state.tutorial.manualPositioning = false;
    state.tutorial.freezeTriedFrozenCell = false;
    state.tutorial.helpStage = 0;
    if (typeof XOApp.restoreHelpTutorialVisibility === 'function') {
      XOApp.restoreHelpTutorialVisibility();
    } else {
      state.tutorial.helpTooltipHidden = false;
      els.tutorialTooltip.style.visibility = '';
      els.tutorialTooltip.style.opacity = '';
      if (state.tutorial.guideElement) {
        state.tutorial.guideElement.style.visibility = '';
        state.tutorial.guideElement.style.opacity = '';
      }
    }
    state.tutorial.settingsStage = 0;
    if (typeof XOApp.clearSettingsPeekMode === 'function') {
      XOApp.clearSettingsPeekMode();
    } else {
      var sd = els.settingsModal.querySelector('.modal-dialog');
      if (sd) sd.classList.remove('settings-peek-mode');
    }
    state.tutorial.modeStage = 0;
    state.tutorial.aiStage = 0;
    state.tutorial._dynamicStepMovedDown = false;
    if (state.tutorial.preTutorialSettings) {
      state.settings.boardSize = state.tutorial.preTutorialSettings.boardSize;
      state.settings.pieceSize = state.tutorial.preTutorialSettings.pieceSize;
      state.settings.theme = state.tutorial.preTutorialSettings.theme;
      if (state.tutorial.preTutorialSettings.gameMode !== undefined) {
        state.settings.gameMode = state.tutorial.preTutorialSettings.gameMode;
        localStorage.setItem('xando-gameMode', state.tutorial.preTutorialSettings.gameMode);
      }
      if (state.tutorial.preTutorialSettings.aiDifficulty !== undefined) {
        state.settings.aiDifficulty = state.tutorial.preTutorialSettings.aiDifficulty;
        localStorage.setItem('xando-aiDifficulty', state.tutorial.preTutorialSettings.aiDifficulty);
      }
      if (state.tutorial.preTutorialSettings.aiFirstMove !== undefined) {
        state.settings.aiFirstMove = state.tutorial.preTutorialSettings.aiFirstMove;
        localStorage.setItem('xando-aiFirstMove', state.tutorial.preTutorialSettings.aiFirstMove);
      }
      XOApp.applyBoardSize();
      XOApp.applyPieceSize();
      XOApp.applyTheme();
      state.tutorial.preTutorialSettings = null;
    }
    hideTutorialCellGuide();
    els.tutorialOverlay.hidden = true;
    els.tutorialOverlay.classList.remove('modal-mode');
    els.tutorialOverlay.classList.remove('interaction-mode');
    els.tutorialOverlay.classList.remove('button-interaction-mode');
    XOApp.hideModal(els.modeModal);
    XOApp.hideModal(els.winModal);
    XOApp.hideModal(els.helpModal);
    XOApp.hideModal(els.settingsModal);
    XOApp.hideModal(els.aiModal);
    els.btnWinClose.textContent = '再来一局';
    localStorage.setItem('xando-tutorial-seen', 'true');
    XOApp.resetGame(MODE_NORMAL);
    stopTutorialPositionLoop();
  }

  function initTutorial() {
    var hasSeen = localStorage.getItem('xando-tutorial-seen');
    if (!hasSeen) {
      state.tutorial.preTutorialSettings = {
        boardSize: state.settings.boardSize,
        pieceSize: state.settings.pieceSize,
        theme: state.settings.theme,
      };
      state.tutorial.active = true;
      state.tutorial.currentStep = 0;
      state.tutorial.totalSteps = TUTORIAL_STEPS.length;
      if (typeof XOApp.clearSettingsPeekMode === 'function') {
        XOApp.clearSettingsPeekMode();
      }
      els.tutorialOverlay.hidden = false;
      startTutorialPositionLoop();
      renderTutorial();
    }
  }

  XOApp.TUTORIAL_STEPS = TUTORIAL_STEPS;
  XOApp.renderTutorial = renderTutorial;
  XOApp.tutorialNext = tutorialNext;
  XOApp.tutorialPrev = tutorialPrev;
  XOApp.endTutorial = endTutorial;
  XOApp.initTutorial = initTutorial;
  XOApp.positionTutorialTooltip = positionTutorialTooltip;
  XOApp.showTutorialCellGuide = showTutorialCellGuide;
  XOApp.hideTutorialCellGuide = hideTutorialCellGuide;
  XOApp.showTutorialUndoGuide = showTutorialUndoGuide;
  XOApp.showTutorialFreezeBtnGuide = showTutorialFreezeBtnGuide;
  XOApp.showTutorialFreezeCellGuide = showTutorialFreezeCellGuide;
  XOApp.showTutorialCancelFreezeBtnGuide = showTutorialCancelFreezeBtnGuide;
  XOApp.showTutorialCancelPersistBtnGuide = showTutorialCancelPersistBtnGuide;
  XOApp.showTutorialPersistBtnGuide = showTutorialPersistBtnGuide;
  XOApp.showTutorialHelpBtnGuide = showTutorialHelpBtnGuide;
  XOApp.showTutorialSettingsBtnGuide = showTutorialSettingsBtnGuide;
  XOApp.startPersistAutoDemo = startPersistAutoDemo;

  function moveDynamicStepTooltipDown() {
    if (state.tutorial.currentStep !== 3 || !state.tutorial.animateDisappear) return;
    state.tutorial._dynamicStepMovedDown = true;
    var targetEl = document.querySelector(TUTORIAL_STEPS[3].target);
    if (!targetEl) return;
    var rect = targetEl.getBoundingClientRect();
    state.tutorial.manualPositioning = true;
    var tooltipWidth = Math.min(window.innerWidth - 32, 400);
    var tooltipHeight = window.innerWidth <= 800 ? 160 : 200;
    var gap = 16;
    var left = rect.left + rect.width / 2 - tooltipWidth / 2;
    if (left < 16) left = 16;
    if (left + tooltipWidth > window.innerWidth - 16) left = window.innerWidth - tooltipWidth - 16;
    var top = rect.bottom + gap + 20;
    if (top + tooltipHeight > window.innerHeight - 16) top = window.innerHeight - tooltipHeight - 16;
    var arrowOffsetX = (rect.left + rect.width / 2) - left - 6;
    arrowOffsetX = Math.max(20, Math.min(tooltipWidth - 20, arrowOffsetX));
    els.tutorialTooltip.className = 'tutorial-tooltip arrow-top';
    els.tutorialTooltip.style.setProperty('--arrow-offset-x', arrowOffsetX + 'px');
    els.tutorialTooltip.style.left = left + 'px';
    els.tutorialTooltip.style.top = top + 'px';
    els.tutorialTooltip.style.transform = 'none';
    els.tutorialTooltip.style.width = window.innerWidth <= 800 ? tooltipWidth + 'px' : '';
  }

  XOApp.moveDynamicStepTooltipDown = moveDynamicStepTooltipDown;

  var _tutorialScrollRafId = null;
  var _tutorialPosLoopRafId = null;

  function _doUpdateTutorialPositions() {
    if (!state.tutorial.active) return;

    if (state.tutorial.guideElement) {
      var targetEl = null;
      if (state.tutorial.interactionCell) {
        targetEl = els.board.querySelector('.cell[data-row="' + state.tutorial.interactionCell[0] + '"][data-col="' + state.tutorial.interactionCell[1] + '"]');
      } else if (state.tutorial.allowedButton) {
        targetEl = document.querySelector(state.tutorial.allowedButton);
      }

      if (targetEl) {
        var rect = targetEl.getBoundingClientRect();
        setGuidePosition(state.tutorial.guideElement, rect, 4);
      }
    }

    updateTutorialHighlightPosition();
  }

  function updateTutorialPositionsOnScroll() {
    if (!state.tutorial.active) return;
    _doUpdateTutorialPositions();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          _doUpdateTutorialPositions();
        });
      });
    });
  }

  function startTutorialPositionLoop() {
    if (_tutorialPosLoopRafId) return;
    function loop() {
      _tutorialPosLoopRafId = requestAnimationFrame(loop);
      updateTutorialPositionsOnScroll();
    }
    _tutorialPosLoopRafId = requestAnimationFrame(loop);
  }

  function stopTutorialPositionLoop() {
    if (_tutorialPosLoopRafId) {
      cancelAnimationFrame(_tutorialPosLoopRafId);
      _tutorialPosLoopRafId = null;
    }
  }

  function onTutorialScroll() {
    if (_tutorialScrollRafId) return;
    _tutorialScrollRafId = requestAnimationFrame(function () {
      _tutorialScrollRafId = null;
      updateTutorialPositionsOnScroll();
    });
  }

  window.addEventListener('scroll', onTutorialScroll, true);

  function bindModalScrollListeners() {
    var dialogs = document.querySelectorAll('.modal-dialog');
    for (var i = 0; i < dialogs.length; i++) {
      dialogs[i].addEventListener('scroll', onTutorialScroll, true);
      dialogs[i].addEventListener('touchmove', onTutorialScroll, { passive: true, capture: true });
    }
  }
  bindModalScrollListeners();

  window.addEventListener('touchmove', onTutorialScroll, { passive: true, capture: true });

  XOApp.updateTutorialPositionsOnScroll = updateTutorialPositionsOnScroll;
  XOApp.bindModalScrollListeners = bindModalScrollListeners;
  XOApp.startTutorialPositionLoop = startTutorialPositionLoop;
  XOApp.stopTutorialPositionLoop = stopTutorialPositionLoop;
})();
