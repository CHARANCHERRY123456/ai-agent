export interface Plugin {
  name: string;
  description: string;
  execute: (input: string) => Promise<string> | string;
}

export interface PluginResult {
  pluginName: string;
  input: string;
  output: string;
}
