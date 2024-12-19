# 🔍 expo-pixel-perfect

Perfect pixel-art scaling for your Expo apps. No blur, no artifacts - just crisp, clean pixels. 


<image src="screenshot.png" alt="Demo showing 16x16 pixel art scaled up with and without expo-pixel-perfect" width="200">

## ✨ Features

- Crisp nearest-neighbor scaling (no blurry pixels!)
- Works with local and remote images
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
            
            // Custom loading component
            loadingComponent={<CustomLoader />}
            
            // Error handling
            fallback={<Text>Failed to load sprite</Text>}
            onError={(error) => console.error('Failed to load:', error)}
            
            // Load callback
            onLoad={() => console.log('Sprite loaded successfully')}
            
            // Custom default size
            defaultSize={{ width: 32, height: 32 }}
            
            // Standard React Native styles
            style={styles.sprite}
        />
    );
}
```

## 🎯 Props

### Required Props

| Prop     | Type                      | Description                     |
|----------|---------------------------|---------------------------------|
| source   | number \| { uri: string } | Local or remote image source    |

### Optional Props

| Prop             | Type                                           | Default           | Description                               |
|------------------|------------------------------------------------|-------------------|-------------------------------------------|
| scale            | number \| { targetWidth: number } \| { targetHeight: number } | 1 | Scaling factor or target dimensions |
| style            | ViewStyle                                      | undefined         | Standard React Native view styles         |
| loadingComponent | ReactNode                                      | ActivityIndicator | Component shown during loading            |
| fallback         | ReactNode                                      | null              | Component shown on error                  |
| onError          | (error: Error) => void                         | undefined         | Error callback                           |
| onLoad           | () => void                                     | undefined         | Success callback                         |
| defaultSize      | { width: number; height: number }              | { width: 16, height: 16 } | Default dimensions if not detected |

## 🎨 Tips

- Start with small source images (8x8, 16x16, 32x32)
- Use PNG format for transparency support
- For dynamic scaling, use targetWidth/targetHeight instead of fixed scale
- Provide fallback components for better user experience
- Set appropriate defaultSize for your assets
- Handle loading and error states for smoother UX
- Use TypeScript for better type safety

## 🤔 Common Issues

### Image appears blurry
Make sure you're using the correct scale factor. For a 16x16 image to display at 64x64, use either:
```tsx
scale={4}
// or
scale={{ targetWidth: 64 }}
```

### Image not loading
Check that your asset path is correct and the image exists. The onError callback can help debug:
```tsx
onError={(error) => console.error('Loading failed:', error)}
```

---
Made for ⚔️ [Pixel Odyssey](pixel-odyssey.app) by Lino Iten