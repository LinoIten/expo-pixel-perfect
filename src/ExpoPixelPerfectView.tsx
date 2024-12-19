import * as React from 'react';
import { requireNativeView } from 'expo';
import { Asset } from 'expo-asset';
import { 
    StyleProp, 
    StyleSheet, 
    ViewStyle, 
    ActivityIndicator,
    View 
} from 'react-native';

type Scale = 
    | number 
    | { targetWidth: number }
    | { targetHeight: number };

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
    defaultSize?: { width: number; height: number };
}

const DEFAULT_SIZE = { width: 16, height: 16 };

const NativeView: React.ComponentType<{
    path: string;
    scale: number;
    style?: StyleProp<ViewStyle>;
}> = requireNativeView('ExpoPixelPerfect');

const calculateScale = (
    scale: Scale | undefined,
    dimensions: { width: number; height: number }
): number => {
    if (typeof scale === 'number') return scale;
    if (!scale) return 1;
    
    if ('targetWidth' in scale) {
        return scale.targetWidth / dimensions.width;
    }
    return scale.targetHeight / dimensions.height;
};

export default function ExpoPixelPerfectView({ 
    source,
    style,
    scale,
    onError,
    onLoad,
    fallback,
    loadingComponent = <ActivityIndicator />,
    defaultSize = DEFAULT_SIZE
}: ExpoPixelPerfectViewProps) {
    const [state, setState] = React.useState<{
        status: 'loading' | 'loaded' | 'error';
        localUri: string | null;
        width: number;
        height: number;
        error?: Error;
    }>({
        status: 'loading',
        localUri: null,
        width: defaultSize.width,
        height: defaultSize.height
    });

    React.useEffect(() => {
        let mounted = true;

        async function loadAsset() {
            try {
                let asset: Asset;
                if (typeof source === 'number') {
                    asset = await Asset.fromModule(source).downloadAsync();
                } else {
                    asset = await Asset.fromURI(source.uri).downloadAsync();
                }

                if (!mounted) return;

                setState({
                    status: 'loaded',
                    localUri: asset.localUri,
                    width: asset.width ?? defaultSize.width,
                    height: asset.height ?? defaultSize.height
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
    }, [source, defaultSize.width, defaultSize.height, onError, onLoad]);

    if (state.status === 'loading') {
        return (
            <View style={[styles.container, style]}>
                {loadingComponent}
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

    const targetScale = calculateScale(scale, {
        width: state.width,
        height: state.height
    });

    const imageSize = {
        width: state.width * targetScale,
        height: state.height * targetScale
    };

    const combinedStyle = StyleSheet.compose(
        imageSize,
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