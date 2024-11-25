
import { Image, StyleSheet, View } from 'react-native';
import { PixelImage } from 'expo-pixel-perfect';

export default function App() {
    return (
        <View style={styles.container}>
            <Image 
                source={require('./assets/chain.png')}
                style={{ width: 192, height: 192 }}
            />
            <PixelImage
                source={require('./assets/chain.png')}
                scale={12}
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
