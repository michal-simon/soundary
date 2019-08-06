goog.provide 'app.Audio'

goog.require 'goog.dom'

class app.Audio

  ###*
    @param {String} src
    @constructor
  ###
  constructor: (src) ->
    @audioSrc = src

    AudioElement = window['Audio'] || window['webkitAudio']

    @audio = new AudioElement(src)
    @audio['repeat'] = true

    AudioContext = window['AudioContext'] || window['webkitAudioContext']

    @ctx = new AudioContext()

    audioSrc = @ctx['createMediaElementSource'](@audio)
    @analyser = @ctx['createAnalyser']()
    @analyser['connect'](@ctx['destination'])
    @analyser['fftSize'] = 256

    audioSrc['connect'](@analyser)

    @frequencyData = new window['Uint8Array'](@analyser['frequencyBinCount'])
  
    @canvasInit()

  canvasInit: ->
    output = goog.dom.getElement('output')
    @canvas = goog.dom.createElement('canvas')
    @canvas['width'] = 360
    @canvas['height'] = 128

    goog.dom.appendChild(output, @audio)
    goog.dom.appendChild(output, @canvas)

    @canvasCtx = @canvas.getContext("2d")

  play: ->
    @audio.play()
    @renderFrame()

  renderFrame: ->
    window['requestAnimationFrame']( =>
        @renderFrame()
    )

    @analyser['getByteFrequencyData'](@frequencyData)

    @canvasCtx.clearRect(0, 0, @canvas['width'], @canvas['height']);

    line = 4

    for val, i in @frequencyData
        value = val/2
        height = @canvas['height'] - value

        @canvasCtx.beginPath()

        @canvasCtx.rect(i*line, @canvas['height'], line-1,-value)
        @canvasCtx['fillStyle'] = '#8ED6FF'
        #@canvasCtx['fillStyle'] = 'rgb('+val+','+val+','+val+')'
        @canvasCtx.fill()
        

        #@canvasCtx.moveTo(i*line, @canvas['height'])
        #@canvasCtx.lineTo(i*line, height)
        #@canvasCtx['strokeStyle'] = 'red'
        #@canvasCtx.stroke()
        @canvasCtx.closePath()

        if i > 90
            break
