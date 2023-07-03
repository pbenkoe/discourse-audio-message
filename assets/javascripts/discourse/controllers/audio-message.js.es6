import Controller from '@ember/controller';
import ModalFunctionality from 'discourse/mixins/modal-functionality';
import { action } from '@ember/object';
import Uppy from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import getUrl from "discourse-common/lib/get-url";
import { getOwner } from "discourse-common/lib/get-owner";

export default Controller.extend(ModalFunctionality, {
  isRecording: false,
  hasRecording: false,
  audioData: null,
  mediaRecorder: null,
  elapsedTime: "0:00",
  startTime: null,
  audioUrl: null,
  uploading: false,
  uploadProgress: 0,

  @action
  startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const mimeType = 'audio/mp4';
      let audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream, { type: mimeType });

      this.mediaRecorder.addEventListener("dataavailable", event => {
        audioChunks.push(event.data);
      });

      this.mediaRecorder.addEventListener("stop", () => {
        this.audioData = new Blob(audioChunks, { type: mimeType });
        this.audioUrl = URL.createObjectURL(this.audioData);
        this.set('hasRecording', true);
        this.set('isRecording', false);
      });

      this.mediaRecorder.start();
      this.set('isRecording', true);
      this.set('startTime', Date.now());
      this.timer = setInterval(() => this.updateElapsedTime(), 1000);
    });
  },

  @action
  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.set('isRecording', false);
      clearInterval(this.timer);
    }
  },

  updateElapsedTime() {
    let elapsedTime = Date.now() - this.startTime;
    this.set('elapsedTime', this.formatTime(elapsedTime));
  },

  formatTime(ms) {
    let seconds = Math.floor((ms / 1000) % 60);
    let minutes = Math.floor((ms / 1000 / 60) % 60);
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return `${minutes}:${seconds}`;
  },

  @action
  discardRecording() {
    if (window.confirm("Are you sure you want to discard this recording?")) {
      this.reset();
    }
  },

  @action
  attachAudioToPost() {
    if (this.audioData) {
      let file = new File([this.audioData], 'recording.mp4', { type: 'audio/mp4' });

      const uppy = new Uppy({
        debug: true,
        autoProceed: true,
        onBeforeUpload: (files) => {
          this.set('uploading', true);
        },
      });

      uppy.use(XHRUpload, {
        endpoint: getUrl("/uploads.json"),
        headers: {
          "X-CSRF-Token": this.session.csrfToken,
        },
      });

      uppy.addFile({
        name: file.name,
        type: file.type,
        data: file,
      });

      uppy.on('upload-progress', (file, progress) => {
        this.set('uploadProgress', Math.round((progress.bytesUploaded / progress.bytesTotal) * 100));
      });

      uppy.on('upload-success', (file, response) => {
        // The upload was successful. Now attach the audio to the post.
        const composer = getOwner(this).lookup('controller:composer');
        composer.model.appendText(`\n![recording|audio](${response.body.short_url})`);
        this.reset();
        this.send("closeModal");
      });

      uppy.on('upload-error', (file, error, response) => {
        // The upload failed.
        console.log("Failed to upload audio: " + error);
        this.set('uploading', false);
      });

      uppy.upload();
    }
  },

  onClose() {
    if (this.isRecording) {
      this.stopRecording();
      this.reset();
      this._super();
    }
  },

  reset() {
    URL.revokeObjectURL(this.audioUrl);
    this.setProperties({
      isRecording: false,
      hasRecording: false,
      audioData: null,
      mediaRecorder: null,
      elapsedTime: "0:00",
      startTime: null,
      audioUrl: null,
      uploading: false,
      uploadProgress: 0
    });
  }
});
