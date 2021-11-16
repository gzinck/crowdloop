const theme = {
  palette: {
    primary: {
      default: '#c76f18',
      dark: '#994d00',
      light: '#d98f45',
      contrastText: '#FFF',
    },
    background: {
      default: '#111',
      light: '#555',
      contrastText: '#FFF',
      // fadedLevel should be in [0, 1) where 0 is the lightest and 1
      // is the darkest. Uses an exponential for fading quickly to dark
      flashing: (fadedLevel: number, curBeat = 1): string => {
        const maxVal = curBeat === 0 ? 100 : 50;
        const colour = maxVal - (maxVal - 20) * Math.sqrt(fadedLevel);
        return `rgb(${colour}, ${colour}, ${colour})`;
      },
    },
    error: {
      default: '#b02000',
    },
    recording: {
      pending: '#bd7b09',
      recording: '#b02000',
    },
  },
  padding: (multiplier = 1): string => `${multiplier * 0.5}rem`,
  shadow: `
    -webkit-filter: drop-shadow(1px 3px 2px rgba(0, 0, 0, 0.7));
    filter: drop-shadow(1px 3px 2px rgba(0, 0, 0, 0.7));`,
};

export default theme;
