import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen w-full bg-gray-100 dark:bg-gray-950">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  );
};

export default Loading;
