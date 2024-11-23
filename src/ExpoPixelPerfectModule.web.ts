import { registerWebModule, NativeModule } from 'expo';

import { ExpoPixelPerfectModuleEvents } from './ExpoPixelPerfect.types';

class ExpoPixelPerfectModule extends NativeModule<ExpoPixelPerfectModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoPixelPerfectModule);
