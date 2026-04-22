import { PromptModel } from './prompt.model';

export type AudioModelProps = {
  id?: string;
  promptId: string;
  url: string;
  prompt?: PromptModel;
  title: string;
};

export class AudioModel {
  id: string;
  promptId: string;
  title: string;
  url: string;
  prompt?: PromptModel;

  constructor(props: AudioModelProps) {
    this.id = props.id || undefined;
    this.promptId = props.promptId;
    this.url = props.url;
    this.title = props.title;

    this.prompt = props.prompt;
  }
}
