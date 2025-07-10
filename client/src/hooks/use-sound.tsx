import { useCallback } from "react";

// Função para criar sons sintetizados elegantes
const createSynthSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = type;
  
  // Envelope ADSR suave
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

// Som de erro elegante - sequência descendente
const playErrorSound = () => {
  setTimeout(() => createSynthSound(800, 0.1), 0);
  setTimeout(() => createSynthSound(600, 0.1), 100);
  setTimeout(() => createSynthSound(400, 0.15), 200);
};

// Som de sucesso elegante - sequência ascendente
const playSuccessSound = () => {
  setTimeout(() => createSynthSound(523.25, 0.1), 0); // C5
  setTimeout(() => createSynthSound(659.25, 0.1), 100); // E5
  setTimeout(() => createSynthSound(783.99, 0.15), 200); // G5
};

// Som de aviso elegante - tom duplo
const playWarningSound = () => {
  setTimeout(() => createSynthSound(440, 0.08), 0);
  setTimeout(() => createSynthSound(440, 0.08), 150);
};

// Som de clique elegante
const playClickSound = () => {
  createSynthSound(1000, 0.05, 'square');
};

export function useSound() {
  const playError = useCallback(() => {
    try {
      playErrorSound();
    } catch (error) {
      console.warn('Não foi possível reproduzir o som de erro');
    }
  }, []);

  const playSuccess = useCallback(() => {
    try {
      playSuccessSound();
    } catch (error) {
      console.warn('Não foi possível reproduzir o som de sucesso');
    }
  }, []);

  const playWarning = useCallback(() => {
    try {
      playWarningSound();
    } catch (error) {
      console.warn('Não foi possível reproduzir o som de aviso');
    }
  }, []);

  const playClick = useCallback(() => {
    try {
      playClickSound();
    } catch (error) {
      console.warn('Não foi possível reproduzir o som de clique');
    }
  }, []);

  return {
    playError,
    playSuccess,
    playWarning,
    playClick,
  };
}