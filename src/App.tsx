import React from 'react';
import { ClockContextProvider } from './components/ClockContext';
import LoopBoard from './components/loopBoard/LoopBoard';
import { LoopContextProvider } from './components/LoopContext';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { GRANT_MIC_ROUTE, LOOP_BOARD_ROUTE } from './routes';
import GrantMicPage from './components/grantMicPage/GrantMicPage';
import { SharedAudioContextProvider } from './audio/SharedAudioContext';

function App() {
  return (
    <ClockContextProvider>
      <SharedAudioContextProvider>
        <LoopContextProvider>
          <Router>
            <Switch>
              <Route path={LOOP_BOARD_ROUTE}>
                <LoopBoard />
              </Route>
              <Route path={GRANT_MIC_ROUTE}>
                <GrantMicPage />
              </Route>
            </Switch>
          </Router>
        </LoopContextProvider>
      </SharedAudioContextProvider>
    </ClockContextProvider>
  );
}

export default App;
