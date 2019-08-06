goog.provide 'app.main'

goog.require 'app.Audio'

###*
  @param {Object} data Server side data.
###
app.main = (data) ->

  audio = new app.Audio(data.audio)

  audio.play()

goog.exportSymbol 'app.main', app.main