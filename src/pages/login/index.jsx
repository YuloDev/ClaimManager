import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import BrandHeader from './components/BrandHeader';
import LoginForm from './components/LoginForm';
import SecurityFeatures from './components/SecurityFeatures';

const LoginPage = () => {
  useEffect(() => {
    // Set page title and meta tags
    document.title = 'Iniciar Sesión - Nexti Claims Manager';
  }, []);

  return (
    <>
      <Helmet>
        <title>Iniciar Sesión - Nexti Claims Manager</title>
        <meta name="description" content="Acceda de forma segura al sistema de gestión de reclamaciones de seguros médicos Nexti con autenticación multirrol y validación IA." />
        <meta name="keywords" content="login, nexti, reclamaciones, seguros médicos, autenticación" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="flex flex-col justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-4xl mx-auto">
            {/* Brand Header */}
            <BrandHeader />

            {/* Main Login Section */}
            <div className="flex justify-center">
              <LoginForm />
            </div>

            {/* Security Features */}
            <SecurityFeatures />

            {/* Footer */}
            <footer className="mt-16 text-center">
              <div className="border-t border-border pt-8">
                <p className="text-sm text-text-secondary">
                  © {new Date()?.getFullYear()} Nexti Business Solutions. Todos los derechos reservados.
                </p>
                <div className="flex justify-center space-x-6 mt-4">
                  <a href="#" className="text-xs text-text-secondary hover:text-primary transition-colors">
                    Política de Privacidad
                  </a>
                  <a href="#" className="text-xs text-text-secondary hover:text-primary transition-colors">
                    Términos de Servicio
                  </a>
                  <a href="#" className="text-xs text-text-secondary hover:text-primary transition-colors">
                    Soporte Técnico
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;