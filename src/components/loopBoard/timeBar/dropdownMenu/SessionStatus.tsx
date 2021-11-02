import React from 'react';
import APIContext from '../../../../contexts/APIContext';
import Button from '../../../generic/Button';
import styled from 'styled-components';
import theme from '../../../../theme';

const Container = styled.div`
  margin: 0.5rem;
  color: ${theme.palette.background.contrastText};
  & > button {
    margin-right: 1rem;
  }
`;

const SessionStatus = (): React.ReactElement => {
  const api = React.useContext(APIContext);

  const hasClient = api.client !== undefined;
  const onClick = React.useCallback(() => {
    if (hasClient) api.endSession();
    else api.startSession();
  }, [api, hasClient]);

  return (
    <Container>
      <Button onClick={onClick}>{hasClient ? 'Stop session' : 'Start session'}</Button>
      {api.client && `Session has started with id ${api.client.sessionID}`}
    </Container>
  );
};

export default SessionStatus;
