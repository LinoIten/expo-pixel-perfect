import { PixelImage } from "expo-pixel-perfect";
import { Image, StyleSheet, View, Text } from "react-native";

export default function App() {
    return (
        <View style={styles.container}>
            <Text>React Native Image</Text>
            <Image 
                source={require('./assets/chain.png')}
                style={{ width: 192, height: 192 }}
            />
            <Text>Expo Pixel Perfect from PNG Asset</Text>
            <PixelImage
                source={require('./assets/chain.png')}
                scale={{
                    targetWidth: 192,
                    targetHeight: 192,
                }}
                android_renderMode="software"
            />
            <Text>Expo Pixel Perfect from base64 String</Text>
            <PixelImage
                source={{ 
                    base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsSAAALEgHS3X78AAAAzElEQVQ4y2MQZ1NlwIddbPjhOMJbEI5h8iDiPxImywCwIXO99LEagssAmCHIiv8fK7TCMATJgP9ATTAMNwTdyRiGwDR3Fgv9X9olCaaRDcEWcCiGgDQ/3KuGVTNOA573uKIYANKI5AWUcMAIGJCT0QwBa8YWiLgM+H96lTJY0/9NQSiuwYbRDYA7F+YSdC8RMoAB2Z+EohiXAQxYDEBPbP/xGoAnb4ANQU61DIQyEzZD+swtwRjEJscAlDDBJikHxA5ouAAJT4FikAEOACgdzQDMkhH7AAAAAElFTkSuQmCC",
                    width: 16, height: 16, 
                }}
                scale={{
                    targetWidth: 192,
                    targetHeight: 192,
                }}
                android_renderMode="software"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
});
