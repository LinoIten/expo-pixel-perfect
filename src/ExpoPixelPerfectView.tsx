import * as React from 'react';
import { requireNativeView } from 'expo';
import { Asset } from 'expo-asset';
import { 
    StyleProp, 
    StyleSheet, 
    ViewStyle,
    View 
} from 'react-native';

type Scale = {
    scale?: number;
    targetWidth?: number;
    targetHeight?: number;
}

type Source = {
    uri: string;
} | number;

type ExpoPixelPerfectViewProps = {
    source: Source;
    style?: StyleProp<ViewStyle>;
    scale?: Scale;
    onError?: (error: Error) => void;
    onLoad?: () => void;
    fallback?: React.ReactNode;
    loadingComponent?: React.ReactNode;
}

const NativeView: React.ComponentType<{
    path: string;
    scale: number;
    style?: StyleProp<ViewStyle>;
}> = requireNativeView('ExpoPixelPerfect');

const calculateScale = (
    scale: Scale | undefined,
    dimensions: { width: number; height: number }
): number => {
    if (!scale) return 1;
    if (scale.scale) return scale.scale;
    
    if (scale.targetHeight) {
        if (scale.targetWidth) {
            return Math.min(
                scale.targetWidth / dimensions.width,
                scale.targetHeight / dimensions.height
            );
        }
        return scale.targetHeight / dimensions.height;
    } else if (scale.targetWidth) {
        return scale.targetWidth / dimensions.width;
    }
    return 1;
};

export default function ExpoPixelPerfectView({ 
    source,
    style,
    scale,
    onError,
    onLoad,
    fallback,
    loadingComponent
}: ExpoPixelPerfectViewProps) {
    const [state, setState] = React.useState<{
        status: 'loading' | 'loaded' | 'error';
        localUri: string | null;
        width: number | null;
        height: number | null;
        error?: Error;
    }>({
        status: 'loading',
        localUri: null,
        width: null,
        height: null
    });

    React.useEffect(() => {
        let mounted = true;

        async function loadAsset() {
            try {
                let asset: Asset;
                if (typeof source === 'number') {
                    if (Asset.fromModule(source).localUri) {
                        asset = Asset.fromModule(source);
                    } else {
                        asset = await Asset.fromModule(source).downloadAsync();
                    }
                } else {
                    asset = await Asset.fromURI(source.uri).downloadAsync();
                }

                if (!mounted) return;

                setState({
                    status: 'loaded',
                    localUri: asset.localUri,
                    width: asset.width,
                    height: asset.height,
                });
                
                onLoad?.();
            } catch (error) {
                if (!mounted) return;

                const assetError = error instanceof Error ? error : new Error('Failed to load asset');
                setState(prev => ({ 
                    ...prev, 
                    status: 'error',
                    error: assetError 
                }));
                
                onError?.(assetError);
            }
        }

        setState(prev => ({ ...prev, status: 'loading' }));
        loadAsset();

        return () => {
            mounted = false;
        };
    }, [source, onError, onLoad]);

    if (state.status === 'loading') {
        return (
            <View style={[styles.container, style, { width: scale?.targetWidth ?? scale?.targetHeight, height: scale?.targetHeight ?? scale?.targetWidth }]}>
                {loadingComponent ?? null}
            </View>
        );
    }

    if (state.status === 'error' || !state.localUri) {
        return fallback ? (
            <View style={[styles.container, style]}>
                {fallback}
            </View>
        ) : null;
    }

    if (state.width === null || state.height === null) {
        return (
            <View style={[styles.container, style, { width: scale?.targetWidth ?? scale?.targetHeight, height: scale?.targetHeight ?? scale?.targetWidth }]}>
                {loadingComponent ?? null}
            </View>
        )
    }

    const targetScale = Math.max(calculateScale(scale, {
        width: state.width,
        height: state.height
    }), 1);

    const combinedStyle = StyleSheet.compose(
        { width: state.width * targetScale, height: state.height * targetScale },
        style
    );

    return (
        <NativeView
            path={state.localUri}
            scale={targetScale}
            style={combinedStyle}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export type { 
    ExpoPixelPerfectViewProps,
    Scale 
};