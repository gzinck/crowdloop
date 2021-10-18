import React from "react";
import { ClockContextProvider } from "./components/ClockContext";
import LoopBoard from "./components/loopBoard/LoopBoard";
import { LoopContextProvider } from "./components/LoopContext";

function App() {
  return (
    <ClockContextProvider>
      <LoopContextProvider>
        <LoopBoard />
      </LoopContextProvider>
    </ClockContextProvider>
  );
}

export default App;
