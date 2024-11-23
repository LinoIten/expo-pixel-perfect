import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoPixelPerfectViewProps } from './ExpoPixelPerfect.types';

const NativeView: React.ComponentType<ExpoPixelPerfectViewProps> =
  requireNativeView('ExpoPixelPerfect');

export default function ExpoPixelPerfectView(props: ExpoPixelPerfectViewProps) {
  return <NativeView {...props} />;
}
