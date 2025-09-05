'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

interface ChurchFormData {
  name: string;
  subdomain: string;
  address: string;
  phone: string;
  email: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export default function RegisterChurchPage() {
  const [formData, setFormData] = useState<ChurchFormData>({
    name: '',
    subdomain: '',
    address: '',
    phone: '',
    email: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Nome da igreja é obrigatório');
      return false;
    }
    
    if (!formData.subdomain.trim()) {
      setError('Subdomínio é obrigatório');
      return false;
    }
    
    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(formData.subdomain)) {
      setError('Subdomínio deve conter apenas letras minúsculas, números e hífens');
      return false;
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Email da igreja é obrigatório e deve ser válido');
      return false;
    }
    
    if (!formData.adminName.trim()) {
      setError('Nome do administrador é obrigatório');
      return false;
    }
    
    if (!formData.adminEmail.trim() || !formData.adminEmail.includes('@')) {
      setError('Email do administrador é obrigatório e deve ser válido');
      return false;
    }
    
    if (formData.adminPassword.length < 8) {
      setError('Senha deve ter pelo menos 8 caracteres');
      return false;
    }
    
    if (formData.adminPassword !== formData.confirmPassword) {
      setError('Senhas não coincidem');
      return false;
    }
    
    if (!formData.acceptTerms) {
      setError('Você deve aceitar os termos de uso');
      return false;
    }
    
    if (!formData.acceptPrivacy) {
      setError('Você deve aceitar a política de privacidade');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/churches/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Erro ao registrar igreja');
        return;
      }
      
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        router.push(`/auth/signin?subdomain=${formData.subdomain}&registered=true`);
      }, 2000);
      
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">
              Igreja Registrada com Sucesso!
            </CardTitle>
            <CardDescription>
              Sua igreja foi registrada e está sendo processada. 
              Você será redirecionado para o login em instantes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Redirecionando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              Cadastrar Igreja
            </CardTitle>
            <CardDescription>
              Registre sua igreja no ChurchSaaS e comece a usar nossa plataforma completa
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Church Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações da Igreja</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Igreja *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Igreja Evangélica Exemplo"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdomínio *</Label>
                  <div className="flex">
                    <Input
                      id="subdomain"
                      name="subdomain"
                      type="text"
                      placeholder="exemplo"
                      value={formData.subdomain}
                      onChange={handleInputChange}
                      className="rounded-r-none"
                      required
                    />
                    <span className="bg-gray-100 border border-l-0 px-3 py-2 text-sm text-gray-600 rounded-r-md">
                      .churchsaas.com
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Apenas letras minúsculas, números e hífens
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="Rua Exemplo, 123 - Bairro, Cidade - Estado"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email da Igreja *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="contato@igreja.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Administrator Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Administrador Principal</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="adminName">Nome Completo *</Label>
                  <Input
                    id="adminName"
                    name="adminName"
                    type="text"
                    placeholder="Pastor João Silva"
                    value={formData.adminName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email *</Label>
                  <Input
                    id="adminEmail"
                    name="adminEmail"
                    type="email"
                    placeholder="pastor@igreja.com"
                    value={formData.adminEmail}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Senha *</Label>
                    <Input
                      id="adminPassword"
                      name="adminPassword"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      value={formData.adminPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirme a senha"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Terms and Privacy */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleCheckboxChange('acceptTerms', checked as boolean)}
                    required
                  />
                  <Label htmlFor="acceptTerms" className="text-sm">
                    Aceito os{' '}
                    <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                      Termos de Uso
                    </a>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptPrivacy"
                    checked={formData.acceptPrivacy}
                    onCheckedChange={(checked) => handleCheckboxChange('acceptPrivacy', checked as boolean)}
                    required
                  />
                  <Label htmlFor="acceptPrivacy" className="text-sm">
                    Aceito a{' '}
                    <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                      Política de Privacidade
                    </a>{' '}
                    e estou ciente dos meus direitos conforme a LGPD
                  </Label>
                </div>
              </div>
              
              {/* Pricing Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Informações de Preço
                </h4>
                <p className="text-sm text-blue-800">
                  • <strong>R$ 1,00</strong> por membro ativo por mês<br/>
                  • <strong>30 dias grátis</strong> para experimentar<br/>
                  • Pagamento via Pix, cartão ou boleto<br/>
                  • Cobrança automática baseada no número de membros ativos
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Registrando...' : 'Registrar Igreja'}
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Já tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/auth/signin')}
                    className="text-blue-600 hover:underline"
                  >
                    Fazer login
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}