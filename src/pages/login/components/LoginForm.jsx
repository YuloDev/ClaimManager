import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions = [
    { value: 'affiliate', label: 'Afiliado' },
    { value: 'analyst', label: 'Analista' },
    { value: 'admin', label: 'Administrador' }
  ];

  const mockCredentials = {
    affiliate: { email: 'afiliado@nexti.com', password: 'afiliado123' },
    analyst: { email: 'analista@nexti.com', password: 'analista123' },
    admin: { email: 'admin@nexti.com', password: 'admin123' }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Formato de correo electrónico inválido';
    }

    if (!formData?.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData?.role) {
      newErrors.role = 'Debe seleccionar un rol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check mock credentials
      const mockCred = mockCredentials?.[formData?.role];
      if (formData?.email === mockCred?.email && formData?.password === mockCred?.password) {
        // Successful login - redirect based on role
        const roleRoutes = {
          affiliate: '/affiliate-dashboard',
          analyst: '/analyst-dashboard',
          admin: '/analytics-dashboard'
        };
        
        navigate(roleRoutes?.[formData?.role]);
      } else {
        setErrors({
          general: 'Credenciales incorrectas. Verifique su correo electrónico y contraseña.'
        });
      }
    } catch (error) {
      setErrors({
        general: 'Error de conexión. Inténtelo de nuevo más tarde.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Mock forgot password functionality
    alert('Se ha enviado un enlace de recuperación a su correo electrónico.');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-xl shadow-card p-8 border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-text-secondary">
            Acceda a su cuenta del sistema de reclamaciones
          </p>
        </div>

        {errors?.general && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-center space-x-3">
            <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0" />
            <p className="text-sm text-error">{errors?.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="ejemplo@nexti.com"
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            error={errors?.email}
            required
            disabled={isLoading}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="Ingrese su contraseña"
            value={formData?.password}
            onChange={(e) => handleInputChange('password', e?.target?.value)}
            error={errors?.password}
            required
            disabled={isLoading}
          />

          <Select
            label="Rol de Usuario"
            placeholder="Seleccione su rol"
            options={roleOptions}
            value={formData?.role}
            onChange={(value) => handleInputChange('role', value)}
            error={errors?.role}
            required
            disabled={isLoading}
          />

          <Button
            type="submit"
            variant="default"
            fullWidth
            loading={isLoading}
            iconName="LogIn"
            iconPosition="right"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={handleForgotPassword}
            className="text-primary hover:text-primary/80"
            disabled={isLoading}
          >
            ¿Olvidó su contraseña?
          </Button>
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="text-sm font-medium text-foreground mb-3">Credenciales de Prueba:</h3>
          <div className="space-y-2 text-xs text-text-secondary">
            <div>
              <strong>Afiliado:</strong> afiliado@nexti.com / afiliado123
            </div>
            <div>
              <strong>Analista:</strong> analista@nexti.com / analista123
            </div>
            <div>
              <strong>Admin:</strong> admin@nexti.com / admin123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;