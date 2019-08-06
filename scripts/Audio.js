export default (function() {

    /**
     @param {String} src
     @constructor
     */
    function Audio(src) {
        var AudioContext, AudioElement, audioSrc;
        this.audioSrc = src;
        AudioElement = window['Audio'] || window['webkitAudio'];
        this.audio = new AudioElement(src);
        this.audio['repeat'] = true;
        AudioContext = window['AudioContext'] || window['webkitAudioContext'];
        this.ctx = new AudioContext();
        audioSrc = this.ctx['createMediaElementSource'](this.audio);
        this.analyser = this.ctx['createAnalyser']();
        this.analyser['connect'](this.ctx['destination']);
        this.analyser['fftSize'] = 256;
        audioSrc['connect'](this.analyser);
        this.frequencyData = new window['Uint8Array'](this.analyser['frequencyBinCount']);
        this.canvasInit();
    }

    Audio.prototype.canvasInit = function() {
        var output;
        output = document.getElementById('output');
        this.canvas = document.createElement('canvas');
        this.canvas['width'] = 360;
        this.canvas['height'] = 128;
        output.append(this.audio);
        output.append(this.canvas);
        return this.canvasCtx = this.canvas.getContext("2d");
    };

    Audio.prototype.play = function() {
        this.audio.play();
        return this.renderFrame();
    };

    Audio.prototype.renderFrame = function() {
        var height, i, j, len, line, ref, results, val, value;
        window['requestAnimationFrame']((function(_this) {
            return function() {
                return _this.renderFrame();
            };
        })(this));
        this.analyser['getByteFrequencyData'](this.frequencyData);
        this.canvasCtx.clearRect(0, 0, this.canvas['width'], this.canvas['height']);
        line = 4;
        ref = this.frequencyData;
        results = [];
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
            val = ref[i];
            value = val / 2;
            height = this.canvas['height'] - value;
            this.canvasCtx.beginPath();
            this.canvasCtx.rect(i * line, this.canvas['height'], line - 1, -value);
            this.canvasCtx['fillStyle'] = '#8ED6FF';
            this.canvasCtx.fill();
            this.canvasCtx.closePath();
            if (i > 90) {
                break;
            } else {
                results.push(void 0);
            }
        }
        return results;
    };

    return Audio;

})();
