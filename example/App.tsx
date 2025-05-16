import { PixelImage } from "expo-pixel-perfect";
import { Image, StyleSheet, View, Text, ScrollView } from "react-native";

// Simple pixel art image as base64 for our examples
const PIXEL_ART_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsSAAALEgHS3X78AAAAzElEQVQ4y2MQZ1NlwIddbPjhOMJbEI5h8iDiPxImywCwIXO99LEagssAmCHIiv8fK7TCMATJgP9ATTAMNwTdyRiGwDR3Fgv9X9olCaaRDcEWcCiGgDQ/3KuGVTNOA573uKIYANKI5AWUcMAIGJCT0QwBa8YWiLgM+H96lTJY0/9NQSiuwYbRDYA7F+YSdC8RMoAB2Z+EohiXAQxYDEBPbP/xGoAnb4ANQU61DIQyEzZD+swtwRjEJscAlDDBJikHxA5ouAAJT4FikAEOACgdzQDMkhH7AAAAAElFTkSuQmCC";

export default function App() {
    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                {/* Integer Scaling Comparison (4x) */}
                <Text style={styles.sectionTitle}>Integer Scaling (4×)</Text>
                <View style={styles.exampleRow}>
                    {/* React Native Default */}
                    <View style={styles.exampleCard}>
                        <Text style={styles.cardTitle}>React Native</Text>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: PIXEL_ART_BASE64 }}
                                style={styles.scaledImage}
                            />
                        </View>
                        <Text style={styles.cardCaption}>Default scaling (blurry)</Text>
                    </View>
                    
                    {/* Hardware Nearest */}
                    <View style={styles.exampleCard}>
                        <Text style={styles.cardTitle}>Hardware + Nearest</Text>
                        <View style={styles.imageContainer}>
                            <PixelImage
                                source={{ base64: PIXEL_ART_BASE64, width: 16, height: 16 }}
                                scale={{ scale: 4 }}
                                scaleMode="nearest"
                                ios_renderMode="hardware"
                                android_renderMode="hardware"
                                style={styles.scaledImage}
                            />
                        </View>
                        <Text style={styles.cardCaption}>Sharp, pixel-perfect</Text>
                    </View>
                    
                    {/* Software Nearest */}
                    <View style={styles.exampleCard}>
                        <Text style={styles.cardTitle}>Software + Nearest</Text>
                        <View style={styles.imageContainer}>
                            <PixelImage
                                source={{ base64: PIXEL_ART_BASE64, width: 16, height: 16 }}
                                scale={{ scale: 4 }}
                                scaleMode="nearest"
                                ios_renderMode="software"
                                android_renderMode="software"
                                style={styles.scaledImage}
                            />
                        </View>
                        <Text style={styles.cardCaption}>CPU-based scaling</Text>
                    </View>
                </View>
                
                {/* Fractional Scaling Comparison */}
                <Text style={styles.sectionTitle}>Fractional Scaling (4.5×)</Text>
                <View style={styles.exampleRow}>
                    {/* Nearest Neighbor for Fractional */}
                    <View style={styles.exampleCard}>
                        <Text style={styles.cardTitle}>Nearest</Text>
                        <View style={styles.imageContainer}>
                            <PixelImage
                                source={{ base64: PIXEL_ART_BASE64, width: 16, height: 16 }}
                                scale={{ targetWidth: 72, targetHeight: 72 }}
                                scaleMode="nearest"
                                style={styles.scaledImageLarge}
                            />
                        </View>
                        <Text style={styles.cardCaption}>Uneven pixels</Text>
                    </View>
                    
                    {/* Fractional Optimized */}
                    <View style={styles.exampleCard}>
                        <Text style={styles.cardTitle}>Fractional Optimized</Text>
                        <View style={styles.imageContainer}>
                            <PixelImage
                                source={{ base64: PIXEL_ART_BASE64, width: 16, height: 16 }}
                                scale={{ targetWidth: 72, targetHeight: 72 }}
                                scaleMode="fractional-optimized"
                                style={styles.scaledImageLarge}
                            />
                        </View>
                        <Text style={styles.cardCaption}>Smoother non-integer scaling</Text>
                    </View>
                </View>
                
                {/* Different Aspect Ratio Scaling */}
                <Text style={styles.sectionTitle}>Different Aspect Ratio (2× width, 3× height)</Text>
                <View style={styles.exampleRow}>
                    {/* Nearest Neighbor for Different Aspect */}
                    <View style={styles.exampleCard}>
                        <Text style={styles.cardTitle}>Nearest</Text>
                        <View style={styles.imageContainer}>
                            <PixelImage
                                source={{ base64: PIXEL_ART_BASE64, width: 16, height: 16 }}
                                scale={{ targetWidth: 32, targetHeight: 48 }}
                                scaleMode="nearest"
                                style={styles.scaledImageMedium}
                            />
                        </View>
                        <Text style={styles.cardCaption}>Stretched pixels</Text>
                    </View>
                    
                    {/* Fractional Optimized for Different Aspect */}
                    <View style={styles.exampleCard}>
                        <Text style={styles.cardTitle}>Fractional Optimized</Text>
                        <View style={styles.imageContainer}>
                            <PixelImage
                                source={{ base64: PIXEL_ART_BASE64, width: 16, height: 16 }}
                                scale={{ targetWidth: 32, targetHeight: 48 }}
                                scaleMode="fractional-optimized"
                                style={styles.scaledImageMedium}
                            />
                        </View>
                        <Text style={styles.cardCaption}>Better interpolation</Text>
                    </View>
                </View>
                
                {/* Animation Sprite Comparison */}
                <Text style={styles.sectionTitle}>Game Character Scaling (3.3×)</Text>
                <View style={styles.exampleRow}>
                    {/* File-based image */}
                    <View style={styles.exampleCard}>
                        <Text style={styles.cardTitle}>Nearest Neighbor</Text>
                        <View style={styles.imageContainer}>
                            <PixelImage
                                source={require('./assets/chain.png')}
                                scale={{ targetWidth: 160, targetHeight: 160 }}
                                scaleMode="nearest"
                                style={styles.scaledImageLarge}
                            />
                        </View>
                        <Text style={styles.cardCaption}>Blocky edges</Text>
                    </View>
                    
                    <View style={styles.exampleCard}>
                        <Text style={styles.cardTitle}>Fractional Optimized</Text>
                        <View style={styles.imageContainer}>
                            <PixelImage
                                source={require('./assets/chain.png')}
                                scale={{ targetWidth: 160, targetHeight: 160 }}
                                scaleMode="fractional-optimized"
                                style={styles.scaledImageLarge}
                            />
                        </View>
                        <Text style={styles.cardCaption}>Smoother diagonals & curves</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        paddingTop: 60,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 12,
        alignSelf: 'center',
        textAlign: "center"
    },
    exampleRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
    },
    exampleCard: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 9,
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    cardCaption: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
    imageContainer: {
        padding: 9,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
    },
    originalImage: {
        width: 16,
        height: 16,
    },
    scaledImage: {
        width: 64,
        height: 64,
    },
    scaledImageMedium: {
        width: 32,
        height: 48,
    },
    scaledImageLarge: {
        width: 72,
        height: 72,
    },
});