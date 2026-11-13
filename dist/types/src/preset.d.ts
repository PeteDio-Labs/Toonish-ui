declare const preset: {
    theme: {
        extend: {
            colors: {
                toon: Record<string, string>;
            };
            fontFamily: {
                [k: string]: string[];
            };
            fontSize: {
                [x: string]: string;
            };
            spacing: Record<string, string>;
            borderRadius: Record<string, string>;
            borderWidth: Record<string, string>;
            boxShadow: {
                [k: string]: string;
            };
            transitionTimingFunction: Record<string, string>;
            transitionDuration: Record<string, string>;
            keyframes: {
                bob: {
                    '0%,60%,100%': {
                        transform: string;
                    };
                    '30%': {
                        transform: string;
                    };
                };
                squash: {
                    '0%,100%': {
                        transform: string;
                    };
                    '20%': {
                        transform: string;
                    };
                    '45%': {
                        transform: string;
                    };
                };
                pop: {
                    '0%': {
                        transform: string;
                        opacity: string;
                    };
                    '70%': {
                        transform: string;
                    };
                    '100%': {
                        transform: string;
                        opacity: string;
                    };
                };
            };
            animation: {
                bob: string;
                squash: string;
                pop: string;
            };
        };
    };
};
export default preset;
