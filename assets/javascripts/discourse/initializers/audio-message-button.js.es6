import { withPluginApi } from "discourse/lib/plugin-api";
import showModal from "discourse/lib/show-modal";

function initializeWithApi(api) {
  const siteSettings = api.container.lookup("site-settings:main");

  if (siteSettings.audio_message_enabled) {
    api.modifyClass("component:d-editor", {
      pluginId: 'audio-message',
      actions: {
        openAudioMessageModal() {
          showModal("audio-message");
        }
      }
    });

    api.onToolbarCreate(tb => {
      tb.addButton({
        id: 'audio-message',
        group: 'extras',
        icon: 'microphone',
        shortcut: 'R',
        sendAction: () => tb.context.send('openAudioMessageModal')
      })
    });
  }
}

export default {
  name: "discourse-audio-message",

  initialize() {
    withPluginApi("0.1", api => initializeWithApi(api));
  }
};
