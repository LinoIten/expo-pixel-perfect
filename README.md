# 🔍 expo-pixel-perfect

Perfect pixel-art scaling for your Expo apps. No blur, no artifacts - just crisp, clean pixels. 


<image src="screenshot.png" alt="Demo showing 16x16 pixel art scaled up with and without expo-pixel-perfect" width="200">

## ✨ Features

- Crisp nearest-neighbor scaling (no blurry pixels!)
- Works with local, remote, and base64 images
- Platform-specific rendering modes (software/hardware) for quality vs performance
- Native performance
- Loading states with customizable components
- Error handling with fallback options
- Type-safe with full TypeScript support
- Zero configuration needed

## 🛠️ Supported Platforms

| Platform | Supported             |
|----------|----------------------|
| iOS      | ✅ New Architecture  |
| Android  | ✅ New Architecture  |
| Web      | ❌                   |

> **Note**: This module requires the New Architecture (Fabric) to be enabled in your Expo project. It will not work with the old architecture.

> **Web Platform**: This module uses native implementations for pixel-perfect scaling and does not support web platforms. For web-specific pixel art needs, consider using CSS solutions or a web-specific library.

## 📦 Installation

```bash
npx expo install expo-pixel-perfect
```

## 🚀 Usage

### Basic Usage

```tsx
import ExpoPixelPerfectView from 'expo-pixel-perfect';

export default function Game() {
    return (
        <ExpoPixelPerfectView
            source={require('./assets/sprite.png')}
            scale={4}
        />
    );
}
```

### Advanced Usage

```tsx
import ExpoPixelPerfectView from 'expo-pixel-perfect';

export default function Game() {
    return (
        <ExpoPixelPerfectView
            // Source image
            source={require('./assets/sprite.png')}
            
            // Scale to specific width
            scale={{ targetWidth: 64 }}
            
            // Platform-specific rendering modes
            android_renderMode="software"  // Higher quality on Android
            ios_renderMode="software"      // Higher quality on iOS
            
            // Custom loading component
            loadingComponent={<CustomLoader />}
            
            // Error handling
            fallback={<Text>Failed to load sprite</Text>}
            onError={(error) => console.error('Failed to load:', error)}
            
            // Load callback
            onLoad={() => console.log('Sprite loaded successfully')}
            
            // Standard React Native styles
            style={styles.sprite}
        />
    );
}
```

### Using Base64 Images

```tsx
import ExpoPixelPerfectView from 'expo-pixel-perfect';

export default function Game() {
    // Base64 encoded pixel art
    const pixelArtBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...';
    
    return (
        <ExpoPixelPerfectView
            source={{
                base64: pixelArtBase64,
                width: 16,  // Original width is required
                height: 16  // Original height is required
            }}
            scale={3}
        />
    );
}
```

## 🎯 Props

### Required Props

| Prop     | Type                                      | Description                     |
|----------|-------------------------------------------|---------------------------------|
| source   | number \| { uri: string } \| { base64: string, width: number, height: number } | Image source (local, remote, or base64)    |

### Optional Props

| Prop             | Type                                           | Default           | Description                               |
|------------------|------------------------------------------------|-------------------|-------------------------------------------|
| scale            | number \| { targetWidth: number } \| { targetHeight: number } | 1 | Scaling factor or target dimensions |
| style            | ViewStyle                                      | undefined         | Standard React Native view styles         |
| loadingComponent | ReactNode                                      | null              | Component shown during loading            |
| fallback         | ReactNode                                      | null              | Component shown on error                  |
| onError          | (error: Error) => void                         | undefined         | Error callback                           |
| onLoad           | () => void                                     | undefined         | Success callback                         |
| android_renderMode | "software" \| "hardware"                      | "hardware"        | Android-specific rendering mode          |
| ios_renderMode   | "software" \| "hardware"                       | "hardware"        | iOS-specific rendering mode              |

## 🖥️ Render Modes

This module provides platform-specific rendering modes to balance between visual quality and performance:

### Android Render Modes

- **software**: Uses CPU-based rendering (View.LAYER_TYPE_SOFTWARE) for highest quality pixel-perfect rendering. Best for static UI elements or when visual quality is critical.
- **hardware**: Uses GPU-accelerated rendering (View.LAYER_TYPE_HARDWARE) for better performance. May have slightly less precise scaling but offers better battery life and performance.

### iOS Render Modes

- **software**: Uses CoreGraphics (CPU-based) rendering with precise nearest-neighbor scaling. Best for static UI elements or when visual quality is critical.
- **hardware**: Uses Core Image (GPU-accelerated) rendering for better performance. May have slightly less precise scaling but offers better battery life and performance.

```tsx
// Example of platform-specific optimization
<ExpoPixelPerfectView 
    source={require('./assets/character.png')} 
    scale={4}
    // Use software rendering on Android for best quality
    android_renderMode="software"
    // Use hardware acceleration on iOS for better performance
    ios_renderMode="hardware"
/>
```

## 🎨 Tips

- Start with small source images (8x8, 16x16, 32x32)
- Use PNG format for transparency support
- For dynamic scaling, use targetWidth/targetHeight instead of fixed scale
- Provide fallback components for better user experience
- Handle loading and error states for smoother UX
- Use "software" rendering mode for static UI elements for best quality
- Use "hardware" rendering mode for animated elements for better performance
- When using base64 images, always specify the original width and height

## 🤔 Common Issues

### Image appears blurry
Make sure you're using the correct scale factor. For a 16x16 image to display at 64x64, use either:
```tsx
scale={4}
// or
scale={{ targetWidth: 64 }}
```

If still blurry, try using the "software" rendering mode:
```tsx
android_renderMode="software"
ios_renderMode="software"
```

### Image not loading
Check that your asset path is correct and the image exists. The onError callback can help debug:
```tsx
onError={(error) => console.error('Loading failed:', error)}
```

### Base64 image has wrong dimensions
When using base64 images, you must specify the original width and height:
```tsx
source={{
    base64: myBase64String,
    width: 16,   // Important! Must be exact
    height: 16   // Important! Must be exact
}}
```

---
Made for ⚔️ [Pixel Odyssey](pixel-odyssey.app) by Lino Iten