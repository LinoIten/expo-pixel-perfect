import { NativeModule, requireNativeModule } from 'expo';

import { ExpoPixelPerfectModuleEvents } from './ExpoPixelPerfect.types';

declare class ExpoPixelPerfectModule extends NativeModule<ExpoPixelPerfectModuleEvents> {
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoPixelPerfectModule>('ExpoPixelPerfect');
