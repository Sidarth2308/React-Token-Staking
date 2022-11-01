import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Mint from "./Pages/Mint";
import Stake from "./Pages/Stake";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mint" element={<Mint />} />
        <Route path="/staking" element={<Stake />} />
      </Routes>
    </Router>
  );
}

export default App;

