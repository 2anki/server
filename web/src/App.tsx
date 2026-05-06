import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { lazy, ReactElement, useState } from 'react';

import { useCookies, CookiesProvider } from 'react-cookie';
import UploadPage from './pages/UploadPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage/AboutPage';

import isOfflineMode from './lib/isOfflineMode';
import DebugPage from './pages/DebugPage';
import { ContactPage } from './pages/ContactPage/ContactPage';
import FavoritesPage from './pages/FavoritesPage';
import { PageLayout } from './components/Layout/PageLayout';
import DeleteAccountPage from './pages/DeleteAccountPage';
import { getErrorMessage } from './components/errors/helpers/getErrorMessage';
import { sendError } from './lib/SendError';
import { useUserLocals } from './lib/hooks/useUserLocals';
import { SkeletonPage } from './components/Skeleton/Skeleton';
import NotFoundPage from './pages/NotFoundPage';

const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const NewPasswordPage = lazy(() => import('./pages/NewPasswordPage'));
const DownloadsPage = lazy(() => import('./pages/DownloadsPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const AccountPage = lazy(() => import('./pages/AccountPage/AccountPage'));
const SuccessfulCheckoutPage = lazy(
  () => import('./pages/SuccessfulCheckout/SuccessfulCheckout')
);
const DocsPage = lazy(() => import('./pages/DocsPage/DocsPage'));
const CardOptionsPage = lazy(() => import('./pages/CardOptionsPage'));
const RulesPage = lazy(() => import('./pages/RulesPage'));
const PreviewPage = lazy(() => import('./pages/PreviewPage'));
const PreviewApkgPage = lazy(() => import('./pages/PreviewApkgPage'));

const queryClient = new QueryClient();

function RequireAuth({
  isLoggedIn,
  isLoading,
  children,
}: Readonly<{
  isLoggedIn: boolean;
  isLoading: boolean;
  children: ReactElement;
}>) {
  if (isLoading) {
    return <SkeletonPage />;
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppContent({
  error,
  setErrorMessage,
}: Readonly<{
  error: Error | null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setErrorMessage: (error: unknown) => void;
}>) {
  const { data, isLoading } = useUserLocals();
  const isLoggedIn = isLoading ? undefined : !!data?.user?.id;
  const isLoggedInResolved = isLoggedIn === true;
  const isPaying =
    !isLoading && (!!data?.locals?.patreon || !!data?.locals?.subscriber);

  const requireAuth = (element: ReactElement) => (
    <RequireAuth isLoggedIn={isLoggedInResolved} isLoading={isLoading}>
      {element}
    </RequireAuth>
  );

  return (
    <BrowserRouter>
      <PageLayout error={error} isLoggedIn={isLoggedIn} isPaying={isPaying}>
        <Routes>
          <Route
            path="/favorites"
            element={requireAuth(
              <FavoritesPage setError={setErrorMessage} />
            )}
          />
          <Route
            path="/downloads"
            element={requireAuth(
              <DownloadsPage setError={setErrorMessage} />
            )}
          />
          <Route
            path="/uploads"
            element={<Navigate to="/downloads" replace />}
          />
          <Route
            path="/upload"
            element={<UploadPage setErrorMessage={setErrorMessage} />}
          />
          <Route
            path="/register"
            element={<RegisterPage setErrorMessage={setErrorMessage} />}
          />
          <Route
            path="/notion"
            element={requireAuth(
              <SearchPage setError={setErrorMessage} />
            )}
          />
          <Route
            path="/search"
            element={<Navigate to="/notion" replace />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/forgot"
            element={<ForgotPasswordPage setErrorMessage={setErrorMessage} />}
          />
          <Route
            path="/users/r/:id"
            element={<NewPasswordPage setErrorMessage={setErrorMessage} />}
          />
          <Route path="/debug" element={<DebugPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/delete-account"
            element={requireAuth(
              <DeleteAccountPage setError={setErrorMessage} />
            )}
          />
          <Route
            path="/pricing"
            element={<PricingPage isLoggedIn={isLoggedInResolved} email={data?.user?.email} />}
          />
          <Route
            path="/"
            element={
              <HomePage
                setErrorMessage={setErrorMessage}
                isLoggedIn={isLoggedInResolved}
              />
            }
          />
          <Route
            path="/successful-checkout"
            element={<SuccessfulCheckoutPage />}
          />
          <Route path="/account" element={requireAuth(<AccountPage />)} />
          <Route path="/settings" element={requireAuth(<AccountPage />)} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/documentation" element={<DocsPage />} />
          <Route path="/documentation/*" element={<DocsPage />} />
          <Route
            path="/settings/card-options"
            element={requireAuth(
              <CardOptionsPage setErrorMessage={setErrorMessage} />
            )}
          />
          <Route
            path="/rules/:id"
            element={requireAuth(
              <RulesPage setErrorMessage={setErrorMessage} />
            )}
          />
          <Route
            path="/preview/:id"
            element={requireAuth(
              <PreviewPage setError={setErrorMessage} />
            )}
          />
          <Route
            path="/preview/apkg/:key"
            element={requireAuth(
              <PreviewApkgPage setError={setErrorMessage} />
            )}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageLayout>
    </BrowserRouter>
  );
}

function AppWithCookies() {
  const [cookies, setCookie] = useCookies(['token']);

  if (isOfflineMode() && !cookies.token) {
    setCookie('token', '?');
  }

  const [apiError, setError] = useState<unknown>(null);
  /**
   * This error handling is for network errors and errors happening in the background.
   * This code should be deleted and error handling should be unified for network requests.
   * */
  const handledError = (error: unknown) => {
    const errorMessage = getErrorMessage(error);
    sendError(error);
    setError(errorMessage);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AppContent
        error={apiError as Error | null}
        setErrorMessage={handledError}
      />
    </QueryClientProvider>
  );
}

function App() {
  return (
    <CookiesProvider defaultSetOptions={{ path: '/' }}>
      <AppWithCookies />
    </CookiesProvider>
  );
}

export default App;
