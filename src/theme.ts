const theme = {
  palette: {
    primary: {
      default: '#c76f18',
      dark: '#994d00',
      contrastText: '#000',
    },
    background: {
      default: '#111',
      light: '#555',
      contrastText: '#FFF',
      // fadedLevel should be in [0, 1) where 0 is the lightest and 1
      // is the darkest. Uses an exponential for fading quickly to dark
      flashing: (fadedLevel: number, curBeat = 1) => {
        const maxVal = curBeat === 0 ? 100 : 50;
        const colour = maxVal - (maxVal - 20) * Math.sqrt(fadedLevel);
        return `rgb(${colour}, ${colour}, ${colour})`;
      },
    },
    recording: {
      pending: '#bd7b09',
      recording: '#b02000',
    },
  },
  padding: (multiplier = 1) => `${multiplier * 0.5}rem`,
};

export default theme;
