import { Howl } from 'howler';

export const sounds = {
  eat: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'],
    volume: 0.5
  }),
  gameOver: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2658/2658-preview.mp3'],
    volume: 0.5
  }),
  move: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2205/2205-preview.mp3'],
    volume: 0.2
  })
};