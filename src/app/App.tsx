import { Route, Switch } from "wouter";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles/globals.css";

// Pages
import LandingPage from "./pages/LandingPage";
import CheckEmailPage from "./pages/auth/CheckEmailPage";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import TransactionsPage from "./pages/dashboard/TransactionsPage";
import WalletsPage from "./pages/dashboard/WalletsPage";
import CreateWalletPage from "./pages/onboarding/CreateWalletPage";
import UploadFacePage from "./pages/onboarding/UploadFacePage";

// Existing Pages
import ConfirmPage from "./pages/confirm";
import GrantPage from "./pages/grant";
import HomePage from "./pages/home"; // Renamed to /clients in PRD

export default function App() {
  return (
    <AuthProvider>
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={LandingPage} />
        <Route path="/signin" component={SignInPage} />
        <Route path="/signup" component={SignUpPage} />
        <Route path="/check-email" component={CheckEmailPage} />
        <Route path="/verify-email" component={VerifyEmailPage} />

        {/* Onboarding Routes (Protected) */}
        <Route path="/onboarding/face">
          <ProtectedRoute>
            <UploadFacePage />
          </ProtectedRoute>
        </Route>
        <Route path="/onboarding/wallet">
          <ProtectedRoute>
            <CreateWalletPage />
          </ProtectedRoute>
        </Route>

        {/* Dashboard Routes (Protected + Verified) */}
        <Route path="/dashboard">
          <ProtectedRoute requireEmailVerified>
            <DashboardPage />
          </ProtectedRoute>
        </Route>
        <Route path="/transactions">
          <ProtectedRoute requireEmailVerified>
            <TransactionsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/wallets">
          <ProtectedRoute requireEmailVerified>
            <WalletsPage />
          </ProtectedRoute>
        </Route>
        <Route path="/profile">
          <ProtectedRoute requireEmailVerified>
            <ProfilePage />
          </ProtectedRoute>
        </Route>
        <Route path="/settings">
          <ProtectedRoute requireEmailVerified>
            <SettingsPage />
          </ProtectedRoute>
        </Route>

        {/* Existing Admin/Grant Routes */}
        <Route path="/clients" component={HomePage} />
        <Route path="/clients/:id" component={GrantPage} />
        <Route path="/clients/:id/confirm" component={ConfirmPage} />

        {/* Fallback/404 */}
        <Route>404 Not Found</Route>
      </Switch>
    </AuthProvider>
  );
}
