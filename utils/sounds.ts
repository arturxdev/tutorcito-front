/**
 * Sound effects URLs for quiz interactions
 * Using free sound effects from Mixkit
 */
export const SOUNDS = {
  CORRECT: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
  INCORRECT: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3',
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  NEXT: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
  COMPLETE: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
} as const;

/**
 * Play sound effect with volume control
 */
export function playSound(url: string, volume: number = 0.5): void {
  if (typeof window === 'undefined') return;
  
  try {
    const audio = new Audio(url);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch(error => {
      console.warn('Sound playback failed:', error);
    });
  } catch (error) {
    console.warn('Error playing sound:', error);
  }
}
