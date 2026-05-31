(function() {
  'use strict';

  window.Gomoku = window.Gomoku || {};
  var G = window.Gomoku;
  var state = G.state;

  var audioContext = null;

  G.audio = {
    init: init,
    playPlaceStone: playPlaceStone,
    playWin: playWin,
    playClick: playClick,
    toggleSound: toggleSound
  };

  function init() {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  function toggleSound(enabled) {
    state.soundEnabled = enabled;
    localStorage.setItem('gomoku-sound', enabled ? 'true' : 'false');
  }

  function playPlaceStone() {
    if (!state.soundEnabled || !audioContext) return;
    resumeAudioContext();

    var osc = audioContext.createOscillator();
    var gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioContext.currentTime);

    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.06);

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.06);
  }

  function playWin() {
    if (!state.soundEnabled || !audioContext) return;
    resumeAudioContext();

    var notes = [660, 880, 1100];
    notes.forEach(function(freq, i) {
      setTimeout(function() {
        var osc = audioContext.createOscillator();
        var gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);

        gain.gain.setValueAtTime(0.25, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);

        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.08);
      }, i * 80);
    });
  }

  function playClick() {
    if (!state.soundEnabled || !audioContext) return;
    resumeAudioContext();

    var osc = audioContext.createOscillator();
    var gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, audioContext.currentTime);

    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.03);

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.03);
  }

  function resumeAudioContext() {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }
})();
