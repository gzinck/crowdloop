// Don't call this unless you are in the SharedAudioContext. The response is
// always cached there.
export const getMicPermissions = (): Promise<MediaStream> => {
  if (!navigator.mediaDevices) {
    return new Promise(() => {
      throw new Error("Device does not support getting microphone audio");
    });
  }
  return navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      return stream;
    })
    .catch((err) => {
      throw new Error("Error getting microphone audio stream: " + err);
    });
};

// Don't call this unless you are in the SharedAudioContext. The response is
// always cached there.
export const hasMicPermissions = (): Promise<boolean> => {
  if (!navigator.mediaDevices) {
    console.error("Device does not support getting microphone audio");
    return new Promise((r) => r(false));
  }
  return navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      return devices.reduce((acc, currDevice) => {
        return (
          acc || (currDevice.kind === "audioinput" && currDevice.label !== "")
        );
      }, false);
    })
    .catch((err) => {
      console.error("Error finding out if we have mic permissions: " + err);
      return false;
    });
};
