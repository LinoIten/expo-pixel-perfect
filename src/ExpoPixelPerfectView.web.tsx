import * as React from 'react';

import { ExpoPixelPerfectViewProps } from './ExpoPixelPerfect.types';

export default function ExpoPixelPerfectView(props: ExpoPixelPerfectViewProps) {
  return (
    <div>
        <img src={props.source.toString()} />
    </div>
  );
}
