import * as React from 'react';

import { ExpoPixelPerfectViewProps } from './ExpoPixelPerfect.types';

export default function ExpoPixelPerfectView(props: ExpoPixelPerfectViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
