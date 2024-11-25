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
    const [img, setImg] = React.useState<{ localUri: string | null, width: number }>(
        { localUri: null, width: 16 }
    );

  React.useEffect(() => {
    async function loadAsset() {
      try {
        const asset = Asset.fromModule(props.source);
        await asset.downloadAsync();


        if (asset.localUri) {
            setImg({ localUri: asset.localUri, width: asset.width ?? 16 });
        }
      } catch (error) {
        console.error('Failed to load asset:', error);
      }
    }

    loadAsset();
  }, [props.source]);

  if (!img.localUri) {
    return null;
  }

  const scale = props.scale || 1;
  
  const imageSize = {
    width: img.width * scale,  
    height: img.width * scale
  };

  const combinedStyle = StyleSheet.compose(
    imageSize,
    props.style
  );

  return (
    <NativeView
      path={img.localUri}
      scale={scale}
      style={combinedStyle}
    />
  );
}

export type { ExpoPixelPerfectViewProps };