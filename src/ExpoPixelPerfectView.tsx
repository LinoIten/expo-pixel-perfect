import * as React from "react";
import { requireNativeView } from "expo";
import { Asset } from "expo-asset";
import { StyleProp, StyleSheet, ViewStyle, View, Platform, ImageSourcePropType } from "react-native";
import { ExpoPixelPerfectViewProps, Scale } from "./ExpoPixelPerfect.types";


const NativeView: React.ComponentType<{
    path?: string;
    base64?: string;
    scale: number;
    android_renderMode?: string;
    ios_renderMode?: string;
    style?: StyleProp<ViewStyle>;
}> = requireNativeView("ExpoPixelPerfect");

const calculateScale = (
    scale: Scale | undefined,
    dimensions: { width: number; height: number },
): number => {
    if (!scale) return 1;
    if (scale.scale) return scale.scale;

    if (scale.targetHeight) {
        if (scale.targetWidth) {
            return Math.min(
                scale.targetWidth / dimensions.width,
                scale.targetHeight / dimensions.height,
            );
        }
        return scale.targetHeight / dimensions.height;
    } else if (scale.targetWidth) {
        return scale.targetWidth / dimensions.width;
    }
    return 1;
};

/**
 * A component for rendering pixel art with perfect scaling.
 * Ensures crisp, sharp pixels without blurring or anti-aliasing.
 * 
 * @example
 * <ExpoPixelPerfectView
 *   source={require('./assets/character.png')}
 *   scale={4}
 *   android_renderMode="software"
 *   ios_renderMode="software"
 * />
 */
export default function ExpoPixelPerfectView({
    source,
    style,
    scale,
    onError,
    onLoad,
    fallback,
    loadingComponent,
    android_renderMode,
    ios_renderMode,
}: ExpoPixelPerfectViewProps) {
    const [state, setState] = React.useState<{
        status: "loading" | "loaded" | "error";
        localUri?: string | null;
        base64Data?: string;
        width: number | null;
        height: number | null;
        error?: Error;
    }>({
        status: "loading",
        width: null,
        height: null,
    });

    React.useEffect(() => {
        let mounted = true;

        async function loadAsset() {
            try {
                // Handle base64 source directly
                if (typeof source === "object" && "base64" in source) {
                    if (mounted) {
                        setState({
                            status: "loaded",
                            base64Data: source.base64,
                            width: source.width,
                            height: source.height,
                        });

                        onLoad?.();
                    }
                    return;
                }

                // Original asset loading logic for URI and require() sources
                let asset: Asset | null = null;
                if (typeof source === "number") {
                    if (Asset.fromModule(source).localUri) {
                        asset = Asset.fromModule(source);
                    } else {
                        asset = await Asset.fromModule(source).downloadAsync();
                    }
                } else if ("uri" in source && typeof source.uri === "string") {
                    asset = await Asset.fromURI(source.uri).downloadAsync();
                }

                if (!mounted) return;
                if (!asset) { throw new Error("Asset not found"); }

                setState({
                    status: "loaded",
                    localUri: asset.localUri,
                    width: asset.width,
                    height: asset.height,
                });

                onLoad?.();
            } catch (error) {
                if (!mounted) return;

                const assetError =
                    error instanceof Error ? error : new Error("Failed to load asset");
                setState((prev) => ({
                    ...prev,
                    status: "error",
                    error: assetError,
                }));

                onError?.(assetError);
            }
        }

        setState((prev) => ({ ...prev, status: "loading" }));
        loadAsset();

        return () => {
            mounted = false;
        };
    }, [source, onError, onLoad]);

    if (state.status === "loading") {
        return (
            <View
                style={[
                    styles.container,
                    style,
                    {
                        width: scale?.targetWidth ?? scale?.targetHeight,
                        height: scale?.targetHeight ?? scale?.targetWidth,
                    },
                ]}
            >
                {loadingComponent ?? null}
            </View>
        );
    }

    if (state.status === "error" || (!state.localUri && !state.base64Data)) {
        return fallback ? (
            <View style={[styles.container, style]}>{fallback}</View>
        ) : null;
    }

    if (state.width === null || state.height === null) {
        return (
            <View
                style={[
                    styles.container,
                    style,
                    {
                        width: scale?.targetWidth ?? scale?.targetHeight,
                        height: scale?.targetHeight ?? scale?.targetWidth,
                    },
                ]}
            >
                {loadingComponent ?? null}
            </View>
        );
    }

    const targetScale = Math.max(
        calculateScale(scale, {
            width: state.width,
            height: state.height,
        }),
        1,
    );

    const combinedStyle = StyleSheet.compose(
        { width: state.width * targetScale, height: state.height * targetScale },
        style,
    );

    // Pass platform-specific props to the native view
    const platformProps = Platform.select({
        android: { android_renderMode },
        ios: { ios_renderMode },
    });

    return (
        <NativeView
            path={state.localUri || undefined}
            base64={state.base64Data}
            scale={targetScale}
            style={combinedStyle}
            {...platformProps}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
    },
});

export type { ExpoPixelPerfectViewProps, Scale as PixelScale };