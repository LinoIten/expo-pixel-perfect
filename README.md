# 🔍 expo-pixel-perfect

Perfect pixel-art scaling for your Expo apps. No blur, no artifacts - just crisp, clean pixels.

<image src="screenshot.png" alt="Demo showing 16x16 pixel art scaled up with and without expo-pixel-perfect" width="200">

## ✨ Features

- Crisp nearest-neighbor scaling (no blurry pixels!)
- Works with local and remote images
- Native performance
- Zero configuration

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

```tsx
import { PixelImage } from 'expo-pixel-perfect';

export default function Game() {
  return (
    <PixelImage
        source={require('./assets/chain.png')}
        scale={4}
    />
  );
}
```

## 🎯 Props

- `source`: [Expo-Asset VirtualAssetModule](https://docs.expo.dev/versions/latest/sdk/asset/#frommodulevirtualassetmodule)
- `scale`: Number
- `style`: Standard view styles

## 🎨 Tips

- Start with small source images (8x8, 16x16, 32x32)
- Use PNG format for transparency support
- Match style width/height to your scaled dimensions

---
Made for ⚔️ [Pixel Odyssey](pixel-odyssey.app) by Lino Iten