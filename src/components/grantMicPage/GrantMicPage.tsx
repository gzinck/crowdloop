import React from "react";
import { useHistory } from "react-router";
import styled from "styled-components";
import SharedAudioContext from "../../audio/SharedAudioContext";
import { LOOP_BOARD_ROUTE } from "../../routes";
import theme from "../../theme";
import Button from "../generic/Button";

const Background = styled.div`
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  background-color: ${theme.palette.background.default};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 5rem;
  color: ${theme.palette.background.contrastText};
`;

const GrantMicPage = (): React.ReactElement => {
  const history = useHistory();
  const audio = React.useContext(SharedAudioContext);

  React.useEffect(() => {
    if (audio.micStream) history.push(LOOP_BOARD_ROUTE);
  }, [history, audio.micStream]);

  return (
    <Background>
      <p>Before starting, we need access to your microphone to record loops.</p>
      {/* {err && <p>There was an error accessing your microphone.</p>} */}
      <Button onClick={audio.getMicStream}>Grant mic access</Button>
    </Background>
  );
};

export default GrantMicPage;
