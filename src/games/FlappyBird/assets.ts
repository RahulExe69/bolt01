// Pre-load images
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const assets = {
  bird: await loadImage('https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/sprites/yellowbird-midflap.png'),
  pipeTop: await loadImage('https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/sprites/pipe-green-top.png'),
  pipeBottom: await loadImage('https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/sprites/pipe-green-bottom.png'),
  background: await loadImage('https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/sprites/background-day.png'),
  ground: await loadImage('https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/master/sprites/base.png'),
};

export const sounds = {
  flap: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'],
    volume: 0.5,
  }),
  score: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'],
    volume: 0.5,
  }),
  hit: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2658/2658-preview.mp3'],
    volume: 0.5,
  }),
};