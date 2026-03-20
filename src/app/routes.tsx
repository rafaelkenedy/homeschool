import { Suspense, lazy } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Splash from '../features/auth/pages/Splash';
import ProfileSelection from '../features/auth/pages/ProfileSelection';
import ProfileCreation from '../features/auth/pages/ProfileCreation';
import Home from '../features/home/pages/Home';
import Letters from '../features/letters/pages/Letters';
import WritingTaskList from '../features/writing/pages/WritingTaskList';
import WritingTask from '../features/writing/pages/WritingTask';
import MatchLettersList from '../features/match-letters/pages/MatchLettersList';
import MatchLettersTask from '../features/match-letters/pages/MatchLettersTask';

const MatchWordsList = lazy(() => import('../features/match-words/pages/MatchWordsList'));
const MatchWordsTask = lazy(() => import('../features/match-words/pages/MatchWordsTask'));

function RouteLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-orange-50">
      <p className="animate-pulse text-2xl font-bold text-orange-400">Carregando…</p>
    </div>
  );
}

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
  },
  {
    path: '/tasks/writing',
    element: <WritingTaskList />,
  },
  {
    path: '/tasks/writing/:taskId',
    element: <WritingTask />,
  },
  {
    path: '/tasks/match-letters',
    element: <MatchLettersList />,
  },
  {
    path: '/tasks/match-letters/:roundId',
    element: <MatchLettersTask />,
  },
  {
    path: '/tasks/match-words',
    element: (
      <Suspense fallback={<RouteLoading />}>
        <MatchWordsList />
      </Suspense>
    ),
  },
  {
    path: '/tasks/match-words/:roundId',
    element: (
      <Suspense fallback={<RouteLoading />}>
        <MatchWordsTask />
      </Suspense>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
