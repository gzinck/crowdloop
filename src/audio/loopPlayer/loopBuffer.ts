import { TimeSettings } from "../../components/ClockContext";
import { SharedAudioContextContents } from "../SharedAudioContext";

const previewSize = 100;

class LoopBuffer {
  private buffers: AudioBuffer[] = [];
  private preview: Float32Array = new Float32Array(previewSize).fill(0);
  private ms: number;
  private head: number;
  private tail: number;
  private nBuffers: number;
  private audio: SharedAudioContextContents;
  /**
   *
   * @param ms duration of the main loop
   * @param head amount of time before the main loop starts (fade-in time)
   * @param tail amount of time after the main loop ends (fade-out time)
   */
  constructor(
    audio: SharedAudioContextContents,
    ms: number,
    head: number,
    tail: number,
    nBuffers: number
  ) {
    this.audio = audio;
    this.ms = ms;
    this.head = head;
    this.tail = tail;
    this.nBuffers = nBuffers;
  }

  public addBuffer(buff: AudioBuffer) {
    this.buffers.push(buff);
  }

  public addBlob(blob: Blob) {
    blob.arrayBuffer().then((buff) => {
      this.audio.ctx.decodeAudioData(buff, (audioBuffer) => {
        this.buffers.push(audioBuffer);
        const floats = audioBuffer.getChannelData(0);
        // @TODO: process this to get the buffers
      });
    });
  }

  public start(time: TimeSettings) {}
}

export default LoopBuffer;
