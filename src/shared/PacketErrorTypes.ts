export interface IPacketErrorData {
  code: number;
  message: string;
}

interface IDefaults {
  [type: string]: IPacketErrorData;
}

const defaults: IDefaults = {
  JOIN_TIMEOUT: {
    code: 1,
    message: 'You were kicked for not joining the game in time. This could be due to a slow internet connection.',
  },
};

export default defaults;
