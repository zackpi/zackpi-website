import React, { useState } from 'react';

const App = () => {
  const articles = [
    {
      title: 'This is my awesome article!',
      date: new Date(),
      thumbnail: 'https://via.placeholder.com/256/256/CCC?Text=thumbnail',
      description: 'this da description',
      content:
        'This is the article content, duh! This is the article content, duh! This is the article content, duh! This is the article content, duh! This is the article content, duh! This is the article content, duh! This is the article content, duh! This is the article content, duh! This is the article content, duh! This is the article content, duh! This is the article content, duh!',
    },
  ];

  const [showModal, setShowModal] = useState(false);
  const [article, setArticle] = useState(articles[0]);

  const selectArticle = index => {
    setShowModal(true);
    setArticle(articles[index]);
  };

  return (
    <div className='relative w-screen h-screen overflow-hidden from-gray-900 to-black bg-gradient-to-t'>
      <div className='flex flex-col space-y-12 p-12 items-center w-full h-full overflow-y-auto'>
        <div className='grid place-content-center w-full h-24 from-blue-900 to-blue-800 bg-gradient-to-t shadow-lg rounded-sm'>
          <h1 className='text-gray-200 text-4xl'>Zachary Pitcher</h1>
        </div>

        {articles.map((a, i) => (
          <button
            className='w-full h-96 flex bg-gray-800 hover:bg-gray-900 transition-colors shadow-lg rounded-sm'
            onClick={() => selectArticle(i)}
          >
            <div className='w-1/2 h-full'>
              <img
                src={article.thumbnail}
                alt='article thumbnail'
                className='w-full h-full object-cover'
              />
            </div>
            <div className='w-1/2 h-full flex flex-col p-4'>
              <h1 className='h-8 text-gray-300 text-xl font-bold'>{article.title}</h1>
              <p className='h-8 m-2 text-gray-300 italic'>{article.description}</p>
              <p className='h-full m-4 text-gray-300 text-left'>{article.content}</p>
            </div>
          </button>
        ))}
      </div>

      <div
        className='absolute inset-0'
        style={{
          pointerEvents: showModal ? 'auto' : 'none',
          opacity: showModal ? 1 : 0,
          transition: 'opacity .2s',
        }}
      >
        <div
          className='absolute inset-0 bg-black bg-opacity-60'
          onClick={() => setShowModal(false)}
        ></div>
        <div
          className='absolute inset-16 lg:w-192 lg:left-1/2 lg:-ml-96 flex flex-col bg-black'
          style={{
            transform: showModal ? 'translateY(0%)' : 'translateY(100%)',
            transition: 'transform .3s',
          }}
        >
          <div className='w-full h-8 px-2 flex justify-between items-center from-gray-700 to-gray-600 bg-gradient-to-t rounded-sm shadow-xl'>
            <h2 className='text-md text-gray-300'>{article.title}</h2>
            <div className='h-4 flex space-x-2'>
              <button className='w-12 h-4 rounded-sm bg-blue-600 text-gray-100 text-xs shadow grid place-content-center'>
                share
              </button>
              <button
                className='w-4 h-4 rounded-sm bg-red-600 text-gray-100 text-sm shadow grid place-content-center'
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
          </div>
          <div className='w-full h-full bg-gray-300'>{article.content}</div>
        </div>
      </div>
    </div>
  );
};

export default App;
