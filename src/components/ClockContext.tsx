import React from "react";

export interface TimeSettings {
  // Global settings affecting ALL loops
  bpbar: number; // beats per bar
  bpm: number; // beats per minute
  startTime: number; // performance.now() when loop started
}

interface ClockContextContents extends TimeSettings {
  updateClock: (props: Partial<TimeSettings>) => void;
}

const defaultSettings: TimeSettings = {
  bpbar: 4,
  bpm: 90,
  startTime: 0,
};

const ClockContext = React.createContext<ClockContextContents>({
  ...defaultSettings,
  updateClock: () => null,
});

export const ClockContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}): React.ReactElement => {
  const [settings, setSettings] = React.useState<TimeSettings>(defaultSettings);

  // On setup, set the start time as now
  React.useEffect(() => {
    setSettings((ctx) => ({
      ...ctx,
      startTime: performance.now(),
    }));
  }, []);

  const updateClock = React.useCallback(
    (timeSettings: Partial<TimeSettings>): void => {
      setSettings((ctx) => ({
        ...ctx,
        ...timeSettings,
      }));
    },
    []
  );

  return (
    <ClockContext.Provider
      value={{
        ...settings,
        updateClock,
      }}
    >
      {children}
    </ClockContext.Provider>
  );
};

export default ClockContext;
