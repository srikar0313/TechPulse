
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { ArticleCard } from './components/ArticleCard';
import { SkeletonCard } from './components/SkeletonCard';
import { Footer } from './components/Footer';
import { fetchTechNews } from './services/geminiService';
import type { Article } from './types';
import { CATEGORIES } from './constants';
import { useTheme } from './hooks/useTheme';

const App: React.FC = () => {
  const [theme, toggleTheme] = useTheme();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedBookmarks = localStorage.getItem('bookmarkedArticles');
      if (storedBookmarks) {
        setBookmarkedArticles(JSON.parse(storedBookmarks));
      }
    } catch (e) {
      console.error("Failed to parse bookmarks from localStorage", e);
    }
  }, []);

  const getArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newsArticles = await fetchTechNews();
      // Add a unique ID to each article for keying and bookmarking
      const articlesWithIds = newsArticles.map((article, index) => ({...article, id: `${article.link}-${index}`}));
      setArticles(articlesWithIds);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch tech news. The AI might be busy, please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getArticles();
    const interval = setInterval(() => {
      getArticles();
    }, 3600000); // 1 hour

    return () => clearInterval(interval);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBookmarkToggle = (articleId: string) => {
    setBookmarkedArticles(prev => {
      const newBookmarks = prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId];
      localStorage.setItem('bookmarkedArticles', JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
      const matchesSearch = searchTerm === '' ||
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [articles, activeCategory, searchTerm]);
  
  const bookmarkedArticleData = useMemo(() => {
    return articles.filter(article => bookmarkedArticles.includes(article.id));
  }, [articles, bookmarkedArticles]);

  const displayedArticles = activeCategory === 'Bookmarks' ? bookmarkedArticleData : filteredArticles;

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        setSearchTerm={setSearchTerm}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
             {activeCategory === 'Bookmarks' ? 'Your Bookmarks' : activeCategory === 'All' ? 'Latest Updates' : `${activeCategory} News`}
          </h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 12 }).map((_, index) => <SkeletonCard key={index} />)
            : displayedArticles.length > 0
              ? displayedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onBookmarkToggle={handleBookmarkToggle}
                    isBookmarked={bookmarkedArticles.includes(article.id)}
                  />
                ))
              : !error && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                      {activeCategory === 'Bookmarks' ? 'You have no bookmarked articles.' : 'No articles found. Try a different search or category.'}
                    </p>
                  </div>
                )
          }
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
