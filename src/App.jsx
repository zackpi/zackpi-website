import React, { useState } from 'react';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import ArtDeco from './components/ArtDeco';

const App = () => {
  return (
    <div className='relative w-screen h-screen overflow-hidden from-gray-900 to-black bg-gradient-to-t'>
      <BrowserRouter>
        <Switch>
          <Route path='/artdeco'>
            <ArtDeco />
          </Route>
          <Route path='/'>
            <Feed />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
};

const Feed = () => {
  return (
    <div className='w-full h-full overflow-y-auto'>
      <div className='mx-auto flex flex-col space-y-12 py-8 px-12 lg:px-0 items-center w-full lg:w-192 h-full'>
        <div className='grid place-content-center w-full from-blue-900 to-blue-800 bg-gradient-to-t shadow-lg rounded-sm'>
          <h1 className='text-gray-200 text-4xl h-12'>Zachary Pitcher</h1>
        </div>

        <Link to='/artdeco'>
          <div className='w-36 h-8 grid place-content-center from-blue-900 to-blue-800 bg-gradient-to-t shadow-lg text-gray-200 rounded-sm'>
            art deco
          </div>
        </Link>
      </div>
    </div>
  );
};

export default App;
