import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { NavBar } from '../components/NavBar';
import { Heart, MessageCircle, Brain, Shield, Zap, Globe, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import heroImage from '../assets/wellness-hero.jpg';

export const Landing = () => {
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Wellness',
      description: 'Get personalized wellness advice powered by advanced AI and RAG technology.',
    },
    {
      icon: MessageCircle,
      title: 'Multi-Channel Support',
      description: 'Chat via web, Telegram, or WhatsApp - wherever you feel most comfortable.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your conversations are secure and private. We prioritize your data protection.',
    },
    {
      icon: Zap,
      title: 'Real-time Responses',
      description: 'Get instant, personalized wellness recommendations and support.',
    },
  ];

  const plans = [
    {
      name: 'Free',
      price: 0,
      interval: 'month',
      description: 'Perfect for getting started',
      features: [
        '50 messages per month',
        '10,000 tokens included',
        'Basic wellness advice',
        'Web chat access',
      ],
      popular: false,
    },
    {
      name: 'Premium',
      price: 19,
      interval: 'month',
      description: 'Enhanced wellness experience',
      features: [
        'Unlimited messages',
        '500,000 tokens included',
        'Advanced wellness plans',
        'Voice input support',
        'Telegram & WhatsApp access',
        'Priority support',
      ],
      popular: true,
    },
    {
      name: 'Business',
      price: 49,
      interval: 'month',
      description: 'For teams and organizations',
      features: [
        'Everything in Premium',
        'Unlimited tokens',
        'Team management',
        'Custom integrations',
        'Analytics dashboard',
        'Dedicated support',
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/10">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Hero Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/60 to-background/80" />
        
        <div className="relative container mx-auto px-4 py-32 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-tight">
                Your AI-Powered{' '}
                <span className="bg-gradient-to-r from-primary to-wellness bg-clip-text text-transparent">
                  Wellness Companion
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get personalized wellness advice, mental health support, and healthy lifestyle 
                recommendations powered by advanced AI technology.
              </p>
            </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/chat">
                <Button size="lg" className="bg-gradient-to-r from-primary to-wellness hover:opacity-90">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start Chatting
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-wellness hover:opacity-90">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Privacy Focused
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-wellness" />
              AI-Powered
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Multi-Platform
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose WellnessAI?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI wellness assistant combines cutting-edge technology with compassionate care 
            to support your mental and physical well-being.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-soft hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-wellness rounded-xl flex items-center justify-center mx-auto">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade as your wellness journey grows. All plans include our core AI features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative border-2 hover:shadow-glow transition-all duration-300 ${
                plan.popular ? 'border-primary shadow-glow' : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary to-wellness text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardContent className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold">
                      ${plan.price}
                      <span className="text-lg text-muted-foreground">/{plan.interval}</span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to={isAuthenticated ? "/subscribe" : "/register"} className="block">
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-primary to-wellness hover:opacity-90' 
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.price === 0 ? 'Get Started' : 'Upgrade Now'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold">
            Ready to start your wellness journey?
          </h2>
          <p className="text-muted-foreground">
            Join thousands of users who trust WellnessAI for their daily wellness support and guidance.
          </p>
          
          {!isAuthenticated && (
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-primary to-wellness hover:opacity-90">
                Get Started Today
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};