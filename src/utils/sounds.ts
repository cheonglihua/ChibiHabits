// A simple utility to play synthesized sounds using the Web Audio API
// This avoids needing external audio files and ensures fast, reliable playback.

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    // Quick pitch drop
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

    // Quick volume envelope
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    
    // Play a cute arpeggio (C5, E5, G5, C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const startTime = ctx.currentTime;
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const noteTime = startTime + i * 0.08;
      
      gainNode.gain.setValueAtTime(0, noteTime);
      gainNode.gain.linearRampToValueAtTime(0.15, noteTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.2);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(noteTime);
      osc.stop(noteTime + 0.2);
    });
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

export function playNotificationSound() {
  try {
    const ctx = getAudioContext();
    
    // Gentle two-tone chime (A5 -> C6)
    const notes = [880.00, 1046.50];
    const startTime = ctx.currentTime;
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      const noteTime = startTime + i * 0.15;
      
      gainNode.gain.setValueAtTime(0, noteTime);
      gainNode.gain.linearRampToValueAtTime(0.1, noteTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.4);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(noteTime);
      osc.stop(noteTime + 0.4);
    });
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

export function playHappySound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    // Happy slide up
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

export function playEatSound() {
  try {
    const ctx = getAudioContext();
    
    // Nom nom sound (alternating pitches quickly)
    const notes = [600, 400, 600, 400];
    const startTime = ctx.currentTime;
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.value = freq;
      
      const noteTime = startTime + i * 0.1;
      
      gainNode.gain.setValueAtTime(0, noteTime);
      gainNode.gain.linearRampToValueAtTime(0.05, noteTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.08);
      
      // Add a lowpass filter to make it sound more like "nom"
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(noteTime);
      osc.stop(noteTime + 0.08);
    });
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}
