import React from 'react';
import theme from '../../../theme';
import Sync from '../../icons/Sync';
import IconButton from '../../generic/IconButton';
import APIContext from '../../../contexts/APIContext';

const SyncButton = (): React.ReactElement => {
  const { client } = React.useContext(APIContext);
  if (!client) return <></>;

  return (
    <IconButton onClick={() => client.clock.sync()}>
      <Sync colour={theme.palette.primary.contrastText} />
    </IconButton>
  );
};

export default SyncButton;
