import type { StyleProp, ViewStyle } from 'react-native';

export type OnRenderEventPayload = {
    rendered: boolean;
};

export type ExpoPixelPerfectModuleEvents = {
    onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  rendered: boolean;
};

export type ExpoPixelPerfectViewProps = {
    source: number | string | {
        uri: string;
        width: number;
        height: number;
    };
    scale: number;
    onRender?: (event: { nativeEvent: OnRenderEventPayload }) => void;
    style?: StyleProp<ViewStyle>;
};
