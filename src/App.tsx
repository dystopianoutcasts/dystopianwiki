import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { VersionPage } from './pages/VersionPage';
import { SectionPage } from './pages/SectionPage';
import { CategoryPage } from './pages/CategoryPage';
import { ArticlePage } from './pages/ArticlePage';
import { SearchPage } from './pages/SearchPage';
import { LearningPathPage } from './pages/LearningPathPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ArticleProvider } from './context/ArticleContext';
import { LearningPathProvider } from './context/LearningPathContext';
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
      <LearningPathProvider>
      <ArticleProvider>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<HomePage />} />

        {/* Search Page */}
        <Route path="/search" element={<SearchPage />} />

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
    </BrowserRouter>
  );
}

export default App;
