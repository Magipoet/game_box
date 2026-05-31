function ensureAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            audioCtx = null;
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playSound(type) {
    if (!soundEnabled) return;
    const ctx = ensureAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    let freq = 440, duration = 0.15, volume = 0.2, wave = 'sine';

    switch (type) {
        case 'flip':
            freq = 320; duration = 0.08; volume = 0.15; wave = 'triangle';
            break;
        case 'match':
            playSequence([
                { f: 523, d: 0.1 }, { f: 659, d: 0.12 }, { f: 784, d: 0.18 }
            ], 0.25);
            return;
        case 'wrong':
            freq = 180; duration = 0.2; volume = 0.2; wave = 'sawtooth';
            break;
        case 'win':
            playSequence([
                { f: 523, d: 0.12 }, { f: 659, d: 0.12 }, { f: 784, d: 0.12 },
                { f: 1047, d: 0.25 }
            ], 0.3);
            return;
        case 'record':
            playSequence([
                { f: 784, d: 0.1 }, { f: 988, d: 0.1 }, { f: 1175, d: 0.1 },
                { f: 1319, d: 0.25 }
            ], 0.35);
            return;
        case 'click':
            freq = 600; duration = 0.05; volume = 0.1; wave = 'square';
            break;
        case 'bomb':
            playSequence([
                { f: 120, d: 0.15 }, { f: 80, d: 0.2 }, { f: 50, d: 0.3 }
            ], 0.4);
            return;
        case 'combo-good':
            playSequence([
                { f: 523, d: 0.08 }, { f: 659, d: 0.1 }, { f: 784, d: 0.12 }
            ], 0.3);
            return;
        case 'combo-epic':
            playSequence([
                { f: 659, d: 0.08 }, { f: 784, d: 0.1 }, { f: 988, d: 0.1 }, { f: 1175, d: 0.15 }
            ], 0.35);
            return;
        case 'combo-legendary':
            playSequence([
                { f: 523, d: 0.08 }, { f: 659, d: 0.08 }, { f: 784, d: 0.08 },
                { f: 988, d: 0.1 }, { f: 1175, d: 0.1 }, { f: 1319, d: 0.15 },
                { f: 1568, d: 0.25 }
            ], 0.4);
            return;
    }

    osc.type = wave;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
}

function playSequence(notes, volume) {
    const ctx = ensureAudio();
    if (!ctx) return;
    let t = ctx.currentTime;
    notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, t);
        gain.gain.setValueAtTime(volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);
        osc.start(t);
        osc.stop(t + n.d);
        t += n.d * 0.85;
    });
}
