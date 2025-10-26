
import React from 'react';
import type { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onBookmarkToggle: (articleId: string) => void;
  isBookmarked: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onBookmarkToggle, isBookmarked }) => {
  const { title, image, source, description, publishedAt, link, id } = article;
  
  const formattedDate = new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-blue-500 uppercase">{source}</span>
            <button onClick={() => onBookmarkToggle(id)} title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`} fill={isBookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            </button>
        </div>
        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white flex-grow">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          {description}
        </p>
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</p>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Read More &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};
