'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Church, 
  Users, 
  MapPin, 
  Music, 
  MessageCircle, 
  Shield, 
  CreditCard, 
  BarChart3,
  Globe,
  Smartphone,
  CheckCircle,
  ArrowRight,
  Star,
  Heart,
  Zap
} from 'lucide-react';

export default function HomePage() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const features = [
    {
      icon: Users,
      title: "Gestão de Membros",
      description: "Sistema completo para gerenciar membros, células e equipes de louvor"
    },
    {
      icon: MapPin,
      title: "Mapa Interativo",
      description: "Visualize células no mapa com busca por endereço e CEP"
    },
    {
      icon: Music,
      title: "Repertório Inteligente",
      description: "IA sugere setlists baseadas no histórico de louvor"
    },
    {
      icon: MessageCircle,
      title: "Chat em Tempo Real",
      description: "Comunicação segura entre células e equipes"
    },
    {
      icon: Shield,
      title: "Conformidade LGPD",
      description: "Proteção total de dados pessoais conforme a lei brasileira"
    },
    {
      icon: CreditCard,
      title: "Pagamentos Brasileiros",
      description: "Pix, cartões e boletos integrados"
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "R$ 1,00",
      period: "por membro ativo",
      description: "Perfeito para igrejas pequenas",
      features: [
        "Até 100 membros",
        "Gestão de células",
        "Chat básico",
        "Suporte por email"
      ],
      popular: false
    },
    {
      name: "Growth",
      price: "R$ 0,80",
      period: "por membro ativo",
      description: "Ideal para igrejas em crescimento",
      features: [
        "Até 500 membros",
        "Mapa interativo",
        "Repertório IA",
        "Chat avançado",
        "Relatórios",
        "Suporte prioritário"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "R$ 0,60",
      period: "por membro ativo",
      description: "Para grandes organizações",
      features: [
        "Membros ilimitados",
        "Todas as funcionalidades",
        "API personalizada",
        "White-label",
        "Suporte 24/7",
        "Gerente dedicado"
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Pastor João Silva",
      church: "Igreja Batista Central",
      text: "Revolucionou nossa gestão. Agora conseguimos acompanhar cada membro e célula de forma eficiente.",
      rating: 5
    },
    {
      name: "Pastora Maria Santos",
      church: "Assembleia de Deus",
      text: "O mapa de células nos ajudou a expandir estrategicamente. Crescemos 40% em 6 meses!",
      rating: 5
    },
    {
      name: "Pastor Carlos Oliveira",
      church: "Igreja Metodista",
      text: "A conformidade com LGPD nos deu tranquilidade total. Sistema seguro e confiável.",
      rating: 5
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Church className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">ChurchSaaS</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Recursos</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Preços</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Depoimentos</a>
              <Button variant="outline">Entrar</Button>
              <Button>Começar Grátis</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
              🚀 Conformidade LGPD Garantida
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Gestão Completa para
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Igrejas</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Sistema SaaS multi-tenant para gerenciar membros, células, equipes de louvor e comunicação. 
              Apenas R$ 1,00 por membro ativo com total conformidade LGPD.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-4">
                Começar Teste Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Recursos Poderosos para Sua Igreja
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar sua igreja de forma eficiente e segura
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`transition-all duration-500 hover:shadow-lg ${
                  currentFeature === index ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
              >
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Igrejas Ativas</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Membros Gerenciados</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime Garantido</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-blue-100">Conformidade LGPD</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Preços Transparentes e Justos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pague apenas pelos membros ativos. Sem taxas ocultas, sem surpresas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${
                  plan.popular ? 'ring-2 ring-blue-500 shadow-xl scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Mais Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-blue-600 my-4">
                    {plan.price}
                    <span className="text-sm text-gray-500 font-normal">/{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Começar Agora
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O Que Nossos Clientes Dizem
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Histórias reais de igrejas que transformaram sua gestão
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.church}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para Transformar Sua Igreja?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de igrejas que já revolucionaram sua gestão com nossa plataforma
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              Começar Teste Grátis de 30 Dias
              <Zap className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600">
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Church className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">ChurchSaaS</span>
              </div>
              <p className="text-gray-400 mb-4">
                Plataforma completa para gestão de igrejas com conformidade LGPD garantida.
              </p>
              <div className="flex space-x-4">
                <Globe className="h-5 w-5 text-gray-400" />
                <Smartphone className="h-5 w-5 text-gray-400" />
                <Heart className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LGPD</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-800" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2024 ChurchSaaS. Todos os direitos reservados.
            </p>
            <p className="text-gray-400">
              Feito com ❤️ para igrejas brasileiras
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}