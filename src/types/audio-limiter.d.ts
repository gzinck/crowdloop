declare module 'audio-limiter' {
  export interface LimiterAudioNodeOptions extends AudioWorkletNodeOptions {
    time?: number;
  }

  export default class LimiterNode extends EventTarget implements AudioNode {
    constructor(context: AudioContext | OfflineAudioContext, options?: LimiterAudioNodeOptions);
    public get channelCount(): number;
    public get channelCountMode(): ChannelCountMode;
    public get channelInterpretation(): ChannelInterpretation;
    public get context(): BaseAudioContext;
    public get numberOfInputs(): number;
    public get numberOfOutputs(): number;
    public connect(destinationNode: AudioNode, output?: number, input?: number): AudioNode;
    public connect(destinationParam: AudioParam, output?: number): void;
    public connect(destination: any, output: any, input?: number);
    public disconnect(): void;
    public disconnect(output: number): void;
    public disconnect(destinationNode: AudioNode): void;
    public disconnect(destinationNode: AudioNode, output: number): void;
    public disconnect(destinationNode: AudioNode, output: number, input: number): void;
    public disconnect(destinationParam: AudioParam): void;
    public disconnect(destinationParam: AudioParam, output: number): void;
    public disconnect(destination?: any, output?: number, input?: number);
  }
}
