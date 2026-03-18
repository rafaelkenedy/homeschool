import React from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Splash from '../features/auth/pages/Splash';
import ProfileSelection from '../features/auth/pages/ProfileSelection';
import ProfileCreation from '../features/auth/pages/ProfileCreation';
import Home from '../features/home/pages/Home';
import Letters from '../features/letters/pages/Letters';

const router = createHashRouter([
  {
    path: '/',
    element: <Splash />,
  },
  {
    path: '/login',
    element: <ProfileSelection />,
  },
  {
    path: '/create-profile',
    element: <ProfileCreation />,
  },
  {
    path: '/home',
    element: <Home />,
  },
  {
    path: '/letters',
    element: <Letters />,
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
