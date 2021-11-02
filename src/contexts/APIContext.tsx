import React from 'react';
import ClientAPI from '../client/ClientAPI';
import SharedAudioContext from './SharedAudioContext';

const sessionID = 'default';

interface APIContextContents {
  client?: ClientAPI;
  startSession: () => void;
  endSession: () => void;
}

const APIContext = React.createContext<APIContextContents>({} as APIContextContents);

export const APIContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}): React.ReactElement => {
  const { ctx } = React.useContext(SharedAudioContext);
  const [client, setClient] = React.useState<ClientAPI>();

  const startSession = React.useCallback(() => {
    setClient((client) => {
      if (client) client.cleanup();
      return new ClientAPI(ctx, sessionID);
    });
  }, [ctx]);

  const endSession = React.useCallback(() => {
    setClient((client) => {
      if (client) client.cleanup();
      return undefined;
    });
  }, []);

  return (
    <APIContext.Provider
      value={{
        client,
        startSession,
        endSession,
      }}
    >
      {children}
    </APIContext.Provider>
  );
};

export default APIContext;
