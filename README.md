# discourse-audio-message

A discourse plugin that allows users to directly record and attach audio messages to their posts.

## Usage

### IMPORTANT
- Add `blob:` to the content security policy script src in your Discourse admin settings
- Add `mp4` to the authorized extensions list in your Discourse admin settings

The plugin adds a microphone button to the post composer UI, through which an audio message can be recorded and attached to the post.

## Installation

- Add the plugin's repo url to your container's `app.yml` file

```yml
hooks:
  after_code:
    - exec:
        cd: $home/plugins
        cmd:
          - git clone https://github.com/discourse/docker_manager.git
          - git clone https://github.com/pbenkoe/discourse-audio-message.git
```

- Rebuild the container

```
cd /var/discourse
./launcher rebuild app
```

You can also check out the [Official Discourse Documentation](https://meta.discourse.org/t/install-plugins-in-discourse/19157) on how to install plugins.

## Known Issues

Once the audio is uploaded and attached to the post, the _preview_ might not be able to play the audio back, until the post is actually submitted. The `short_url` is used to attach a link to the uploaded audio in the post, not sure why it only plays back once posted.

## Disclaimer

This plugin was developed with the help of ChatGPT. I don't have a background in Javascript development, and finding documentation about plugin development for Discourse that goes beyond a basic setup, was rather difficult to find. I'm not sure if best practices are followed here, but the code base might serve as a rudimentary foundation to build upon.

The plugin currently uses the MediaRecorder API, recording in the `mp4` format, which seemed to be a good solution, supporting most modern web browsers, but I'm happy to receive feedback or pull requests, if there are better ways to implement this.

## License

discourse-audio-message is released under the MIT license. [See LICENSE](https://github.com/pbenkoe/discourse-audio-message/blob/main/LICENSE) for details.
