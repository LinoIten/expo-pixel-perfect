import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';

export type OnRenderEventPayload = {
    rendered: boolean;
};

export type ExpoPixelPerfectModuleEvents = {
    onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  rendered: boolean;
};

/**
 * Scaling options for the pixel perfect view
 */
export type Scale = {
    /**
     * Direct scaling factor. A value of 2 will double the size of the image.
     * 
     * @example
     * // Scale the image 3x its original size
     * scale: 3
     */
    scale?: number;
    
    /**
     * Target width in pixels. The image will be scaled to match this width while preserving aspect ratio.
     * 
     * @example
     * // Scale the image to be 128px wide
     * targetWidth: 128
     */
    targetWidth?: number;
    
    /**
     * Target height in pixels. The image will be scaled to match this height while preserving aspect ratio.
     * 
     * @example
     * // Scale the image to be 64px tall
     * targetHeight: 64
     */
    targetHeight?: number;
};

/**
 * Source types for the pixel perfect view
 */
export type Source =
    | {
        /**
         * Remote image URI
         * 
         * @example
         * { uri: 'https://example.com/pixel-art.png' }
         */
        uri: string;
      }
    | number | ImageSourcePropType
    | {
        /**
         * Base64 encoded image data
         * 
         * @example
         * { 
         *   base64: 'data:image/png;base64,iVBORw...', 
         *   width: 16, 
         *   height: 16 
         * }
         */
        base64: string;
        
        /**
         * Original width of the base64 image in pixels
         */
        width: number;
        
        /**
         * Original height of the base64 image in pixels
         */
        height: number;
      };

/**
 * Props for the ExpoPixelPerfectView component
 */
export type ExpoPixelPerfectViewProps = {
    /**
     * Image source to display. Can be a require() call, a remote URI, or base64 data.
     * 
     * @example
     * // Local image
     * source={require('./assets/sprite.png')}
     * 
     * // Remote image
     * source={{ uri: 'https://example.com/pixel-art.png' }}
     * 
     * // Base64 image
     * source={{ 
     *   base64: 'data:image/png;base64,iVBORw...', 
     *   width: 16, 
     *   height: 16 
     * }}
     */
    source: Source;

    
    /**
     * Controls how scaling is applied to the image, especially for non-integer scales.
     * 
     * - "nearest": Simple nearest-neighbor scaling (best for integer scales like 2x, 3x)
     * - "fractional-optimized": Advanced algorithm for non-integer scales (looks sharper but uses more resources)
     * 
     * @default "nearest"
     */
    scaleMode?: "nearest" | "fractional-optimized";
    
    /**
     * Style applied to the view container
     */
    style?: StyleProp<ViewStyle>;
    
    /**
     * Scaling options. Can be a direct scale factor or target dimensions.
     * 
     * @example
     * // Direct scale factor
     * scale={{ scale: 3 }}
     * 
     * // Target width
     * scale={{ targetWidth: 64 }}
     * 
     * // Target height
     * scale={{ targetHeight: 32 }}
     */
    scale?: Scale;
    
    /**
     * Callback function when an error occurs during image loading
     * 
     * @param error The error that occurred
     */
    onError?: (error: Error) => void;
    
    /**
     * Callback function when the image is successfully loaded
     */
    onLoad?: () => void;
    
    /**
     * Component to display when an error occurs during image loading
     */
    fallback?: React.ReactNode;
    
    /**
     * Component to display while the image is loading
     */
    loadingComponent?: React.ReactNode;
    
    /**
     * Android-specific rendering mode. Use 'software' for highest quality pixel-perfect rendering,
     * or 'hardware' for better performance.
     * 
     * 'software' uses CPU-based rendering with better nearest-neighbor scaling
     * 'hardware' uses GPU-accelerated rendering which may be less precise but more performant
     * 
     * @default "hardware"
     */
    android_renderMode?: "software" | "hardware";
    
    /**
     * iOS-specific rendering mode. Use 'software' for highest quality pixel-perfect rendering,
     * or 'hardware' for better performance.
     * 
     * 'software' uses CoreGraphics (CPU-based) rendering with perfect nearest-neighbor scaling
     * 'hardware' uses Core Image (GPU-accelerated) rendering which may be less precise but more performant
     * 
     * @default "hardware"
     */
    ios_renderMode?: "software" | "hardware";
};