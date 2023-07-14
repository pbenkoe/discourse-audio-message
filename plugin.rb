# name: discourse-audio-message
# about: A discourse plugin that allows users to attach audio messages to their posts
# version: 0.2
# authors: Peter Be
# url: https://github.com/pbenkoe/discourse-audio-message

register_svg_icon "fa-microphone" if respond_to?(:register_svg_icon)

register_asset 'stylesheets/discourse-audio-message.scss'

enabled_site_setting :audio_message_enabled
