import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { VersionPage } from './pages/VersionPage';
import { SectionPage } from './pages/SectionPage';
import { CategoryPage } from './pages/CategoryPage';
import { ArticlePage } from './pages/ArticlePage';
import { SearchPage } from './pages/SearchPage';
import { LearningPathPage } from './pages/LearningPathPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { SettingsPage } from './pages/SettingsPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { LoginPage } from './pages/LoginPage';
import { MascotVotePage } from './pages/MascotVotePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ArticleProvider } from './context/ArticleContext';
import { LearningPathProvider } from './context/LearningPathContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { goTo, takeRememberedNext } from './utils/loginNext';
import { checkForContentUpdates } from './utils/manifestChecker';

// Import global styles
import './styles/variables.css';
import './styles/base.css';
import './styles/animations.css';

// Backup for the OAuth round trip: if the provider returns the member somewhere other
// than /login, forward them to the destination remembered when they pressed the button.
function PendingNextRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!user || pathname === '/login' || pathname === '/register') return;
    const next = takeRememberedNext();
    if (next) goTo(next, navigate);
    // Runs when the session appears, not on every navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return null;
}

function App() {
  // Check for content updates on app load
  useEffect(() => {
    checkForContentUpdates().catch(console.error);
  }, []);

  return (
    <BrowserRouter basename="/">
      <AuthProvider>
      <PendingNextRedirect />
      <LearningPathProvider>
      <ArticleProvider>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<HomePage />} />

        {/* Search Page */}
        <Route path="/search" element={<SearchPage />} />

        {/* Login and register: one page, two modes. Above the /:version routes. */}
        <Route path="/login" element={<LoginPage mode="login" />} />
        <Route path="/register" element={<LoginPage mode="register" />} />

        {/* Mascot vote. Above the /:version routes. */}
        <Route path="/vote" element={<MascotVotePage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />

        {/* User Pages (wrapped in Layout so the header and its Log in button show) */}
        <Route path="/bookmarks" element={<Layout><BookmarksPage /></Layout>} />
        <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
        <Route path="/terms" element={<Layout><TermsPage /></Layout>} />
        <Route path="/privacy-policy" element={<Layout><PrivacyPolicyPage /></Layout>} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Learning Path - PZ specific for now */}
        <Route path="/learning-path" element={<LearningPathPage />} />
        <Route path="/pz/learning-path" element={<LearningPathPage />} />

        {/* Game-prefixed routes (new structure) */}
        {/* PZ Routes - /pz/:version/:section/:category/:slug */}
        <Route path="/pz/:version" element={<VersionPage />} />
        <Route path="/pz/:version/:section" element={<SectionPage />} />
        <Route path="/pz/:version/:section/:category" element={<CategoryPage />} />
        <Route path="/pz/:version/:section/:category/:slug" element={<ArticlePage />} />

        {/* Legacy routes (redirect or support old URLs) */}
        {/* Version Landing */}
        <Route path="/:version" element={<VersionPage />} />

        {/* Section Landing */}
        <Route path="/:version/:section" element={<SectionPage />} />

        {/* Category Listing */}
        <Route path="/:version/:section/:category" element={<CategoryPage />} />

        {/* Article Page */}
        <Route path="/:version/:section/:category/:slug" element={<ArticlePage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </ArticleProvider>
      </LearningPathProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
