import { Link, Route, Switch, Router } from "wouter";
import "./index.css";
import HomePage from "./pages/home";
import Header from "./components/Header";
import GrantPage from "./pages/grant";
import ConfirmPage from "./pages/confirm";

export function App() {
  return (
    <>
      <Header />
      <main>
        <Router>
          <Route path="/" component={HomePage} />
          <Route path="/clients/:id" component={GrantPage} />
          <Route path="/clients/:id/confirm" component={ConfirmPage} />
        </Router>
      </main>
    </>
  );
}

export default App;
