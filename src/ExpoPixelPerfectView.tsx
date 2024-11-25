// src/ExpoPixelPerfectView.tsx
import { requireNativeView } from 'expo';
import { Asset } from 'expo-asset';
import * as React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

interface ExpoPixelPerfectViewProps {
  source: number;
  scale?: number;
  style?: StyleProp<ViewStyle>;
}

const NativeView: React.ComponentType<{
  path: string;
  scale: number;
  style?: StyleProp<ViewStyle>;
}> = requireNativeView('ExpoPixelPerfect');

export default function ExpoPixelPerfectView(props: ExpoPixelPerfectViewProps) {
  const [localUri, setLocalUri] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadAsset() {
      try {
        const asset = Asset.fromModule(props.source);
        await asset.downloadAsync();
        if (asset.localUri) {
          setLocalUri(asset.localUri);
        }
      } catch (error) {
        console.error('Failed to load asset:', error);
      }
    }

    loadAsset();
  }, [props.source]);

  if (!localUri) {
    return null;
  }

  const scale = props.scale || 1;
  
  // If original image is 16x16 and scale is 4, style should be 64x64
  const imageSize = {
    width: 16 * scale,  // Assuming original is 16x16
    height: 16 * scale
  };

  const combinedStyle = StyleSheet.compose(
    imageSize,
    props.style
  );

  return (
    <NativeView
      path={localUri}
      scale={scale}
      style={combinedStyle}
    />
  );
}

export type { ExpoPixelPerfectViewProps };