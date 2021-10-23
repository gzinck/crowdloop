const theme = {
    palette: {
        primary: {
            default: "#c76f18",
            dark: "#994d00",
            contrastText: "#000"
        },
        background: {
            default: "#000",
            light: "#555",
            contrastText: "#FFF"
        },
        recording: {
            pending: "#bd7b09",
            recording: "#b02000",
        }
    },
    padding: (multiplier: number = 1) => `${multiplier * 0.5}rem`
};

export default theme;