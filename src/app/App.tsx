import { Link, Route, Switch, Router } from "wouter";
import "./index.css";
import HomePage from "./pages/home";
import Header from "./components/Header";
import GrantPage from "./pages/grant";

export function App() {
  return (
    <>
      <Header />
      <main>
        <Router>
          <Route path="/" component={HomePage} />
          <Route path="/grant" component={GrantPage} />
        </Router>
      </main>
    </>
  );
}

export default App;
