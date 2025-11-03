import React from 'react';

const Tabs = ({ tabs, activeTab, onTabChange, className = '' }) => {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              whitespace-nowrap py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex-shrink-0
              ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
              transition-colors duration-200
            `}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.icon && (
              <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-1 sm:mr-2" />
            )}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            {tab.count !== undefined && (
              <span className={`
                ml-1 sm:ml-2 py-0.5 px-1 sm:px-2 rounded-full text-xs
                ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                }
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;