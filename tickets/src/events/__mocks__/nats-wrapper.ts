export const natsWrapper = {
  client: {
    // DODAO SAM publish FUNKCIJU
    publish(channelName: string, data: any, callback: () => void): void {
      // EVO POZVALI SMO callback
      callback();
    },
  },
};
