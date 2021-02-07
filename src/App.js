import React from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { Editor } from "./pages/Editor";
import { Home } from "./pages/Home";

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/project/:projectRoot">
          <Editor />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}

// import logo from "./logo.svg";
// import "./App.css";

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
