import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ArticleProvider } from './context/ArticleContext';
import { LearningPathProvider } from './context/LearningPathContext';
import { AuthProvider } from './context/AuthContext';
import { checkForContentUpdates } from './utils/manifestChecker';

// Import global styles
import './styles/variables.css';
import './styles/base.css';
import './styles/animations.css';

function App() {
  // Check for content updates on app load
  useEffect(() => {
    checkForContentUpdates().catch(console.error);
  }, []);

  return (
    <BrowserRouter basename="/">
      <AuthProvider>
      <LearningPathProvider>
      <ArticleProvider>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<HomePage />} />

        {/* Search Page */}
        <Route path="/search" element={<SearchPage />} />

        {/* User Pages */}
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
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
