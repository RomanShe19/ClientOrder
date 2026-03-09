import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PageContainer } from './components/layout/PageContainer';
import { LeadForm } from './components/form/LeadForm';
import { AdminRoutes } from './admin/routes/adminRoutes';

const HomePage = () => (
  <div className="min-h-screen-safe flex flex-col bg-secondary">
    <Header />
    <PageContainer>
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-premium mb-3">
          Оставьте заявку
        </h1>
        <p className="text-text-secondary max-w-xl mx-auto text-lg">
          Заполните форму, и мы подготовим для вас персональное предложение
        </p>
      </div>
      <LeadForm />
    </PageContainer>
    <Footer />
  </div>
);

export const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
