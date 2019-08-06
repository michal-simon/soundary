import Audio from './Audio';

window.onload = () => {
    const audio = new Audio('./audio/song.mp3');

    audio.play()
};