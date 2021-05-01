export const natsWrapper = {
  client: {
    /* publish(channelName: string, data: any, callback: () => void): void {
      callback();
    }, */

    // DAKLE PASS-UJEMO IN POMENUTU FAKE FUNKCIJU
    // KROZ METOFU mockImplementation
    publish: jest
      .fn()
      .mockImplementation(
        (channelName: string, data: any, callback: () => void): void => {
          //
          //
          //
          // I DALJE DAKLE OVDE MORAMO
          // PZVATI callback
          callback();
        }
      ),
  },
};
