import { registerWebModule, NativeModule } from 'expo';

import { ExpoPixelPerfectModuleEvents } from './ExpoPixelPerfect.types';

class ExpoPixelPerfectModule extends NativeModule<ExpoPixelPerfectModuleEvents> {
}

export default registerWebModule(ExpoPixelPerfectModule);
