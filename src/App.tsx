import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { VersionPage } from './pages/VersionPage';
import { SectionPage } from './pages/SectionPage';
import { CategoryPage } from './pages/CategoryPage';
import { ArticlePage } from './pages/ArticlePage';
import { SearchPage } from './pages/SearchPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Import global styles
import './styles/variables.css';
import './styles/base.css';

function App() {
  return (
    <BrowserRouter basename="/dystopianwiki">
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<HomePage />} />

        {/* Search Page */}
        <Route path="/search" element={<SearchPage />} />

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
    </BrowserRouter>
  );
}

export default App;
