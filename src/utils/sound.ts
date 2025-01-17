export function playSound(url: string) {
  const audio = new Audio(url);
  audio.play();
}

export function playSoundMessage() {
  playSound("./message.mp3");
}
