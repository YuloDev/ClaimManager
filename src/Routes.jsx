import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import AnalyticsDashboard from './pages/analytics-dashboard';
import PlanManagement from './pages/plan-management';
import DocumentValidation from './pages/document-validation';
import ClaimSubmission from './pages/claim-submission';
import LoginPage from './pages/login';
import AffiliateDashboard from './pages/affiliate-dashboard';
import AnalystDashboard from './pages/analyst-dashboard';
import ClaimDetails from './pages/claim-details';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<AffiliateDashboard />} />
        <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
        <Route path="/plan-management" element={<PlanManagement />} />
        <Route path="/document-validation" element={<DocumentValidation />} />
        <Route path="/claim-submission" element={<ClaimSubmission />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/affiliate-dashboard" element={<AffiliateDashboard />} />
        <Route path="/analyst-dashboard" element={<AnalystDashboard />} />
        <Route path="/claim-details" element={<ClaimDetails />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
