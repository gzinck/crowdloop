import React from 'react';
import { ClockContextProvider } from './contexts/ClockContext';
import LoopBoard from './components/loopBoard/LoopBoard';
import { LoopContextProvider } from './contexts/LoopContext';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { GRANT_MIC_ROUTE, LOOP_BOARD_ROUTE } from './routes';
import GrantMicPage from './components/grantMicPage/GrantMicPage';
import { SharedAudioContextProvider } from './contexts/SharedAudioContext';
import { APIContextProvider } from './contexts/APIContext';

function App(): React.ReactElement {
  return (
    <Router>
      <ClockContextProvider>
        <SharedAudioContextProvider>
          <APIContextProvider>
            <LoopContextProvider>
              <Switch>
                <Route path={LOOP_BOARD_ROUTE}>
                  <LoopBoard />
                </Route>
                <Route path={GRANT_MIC_ROUTE}>
                  <GrantMicPage />
                </Route>
              </Switch>
            </LoopContextProvider>
          </APIContextProvider>
        </SharedAudioContextProvider>
      </ClockContextProvider>
    </Router>
  );
}

export default App;
