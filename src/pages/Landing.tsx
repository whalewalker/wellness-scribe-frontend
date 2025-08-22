import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { NavBar } from '../components/NavBar';
import { Heart, MessageCircle, Brain, Shield, Zap, Globe, Check, Star, ArrowRight, Users, Activity } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import heroImage from '../assets/wellness-hero.jpg';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const Landing = () => {
  const { isAuthenticated } = useAuthStore();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Wellness',
      description: 'Get personalized wellness advice powered by advanced AI and RAG technology.',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: MessageCircle,
      title: 'Multi-Channel Support',
      description: 'Chat via web, Telegram, or WhatsApp - wherever you feel most comfortable.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your conversations are secure and private. We prioritize your data protection.',
      color: 'from-amber-500 to-orange-600'
    },
    {
      icon: Zap,
      title: 'Real-time Responses',
      description: 'Get instant, personalized wellness recommendations and support.',
      color: 'from-pink-500 to-rose-600'
    },
  ];

  const stats = [
    { icon: Users, value: '10K+', label: 'Active Users' },
    { icon: MessageCircle, value: '1M+', label: 'Conversations' },
    { icon: Heart, value: '99%', label: 'Satisfaction' },
    { icon: Activity, value: '24/7', label: 'Support' },
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center pt-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
            animate={{ 
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-3xl"
            animate={{ 
              x: [0, -40, 0],
              y: [0, 40, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>

        {/* Hero Image Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            transform: `translateY(${scrollY * 0.5}px)`
          }}
        />
        
        <div className="relative container mx-auto px-4 py-20">
          <motion.div 
            className="max-w-6xl mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="space-y-8"
              variants={itemVariants}
            >
              {/* Badge */}
              <motion.div 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/20 rounded-full px-6 py-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trusted by 10,000+ users worldwide
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1 
                className="text-hero leading-tight"
                variants={itemVariants}
              >
                Your AI-Powered{' '}
                <motion.span 
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  Wellness
                </motion.span>
                <br />
                <motion.span
                  className="block mt-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['100% 50%', '0% 50%', '100% 50%']
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 0.5
                  }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  Companion
                </motion.span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                className="text-subtitle text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
                variants={itemVariants}
              >
                Get personalized wellness advice, mental health support, and healthy lifestyle 
                recommendations powered by advanced AI technology. Your journey to better well-being starts here.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
                variants={itemVariants}
              >
            {isAuthenticated ? (
              <Link to="/chat">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                      >
                        <MessageCircle className="w-6 h-6 mr-3" />
                  Start Chatting
                        <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                    </motion.div>
              </Link>
            ) : (
              <>
                <Link to="/register">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          size="lg" 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                    Get Started Free
                          <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                      </motion.div>
                </Link>
                <Link to="/login">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          size="lg" 
                          variant="outline"
                          className="border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-8 py-4 text-lg rounded-2xl backdrop-blur-sm transition-all duration-300"
                        >
                    Sign In
                  </Button>
                      </motion.div>
                </Link>
              </>
            )}
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                className="flex flex-wrap items-center justify-center gap-8 pt-12 text-sm text-gray-500 dark:text-gray-400"
                variants={itemVariants}
              >
                {[
                  { icon: Shield, text: 'Privacy Focused' },
                  { icon: Heart, text: 'AI-Powered' },
                  { icon: Globe, text: 'Multi-Platform' }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.1, color: '#3b82f6' }}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.text}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
          </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
        </div>
                <motion.div 
                  className="text-3xl font-bold text-gray-900 dark:text-white"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Why Choose WellnessAI?
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
            Our AI wellness assistant combines cutting-edge technology with compassionate care 
            to support your mental and physical well-being.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ 
                  y: -10,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 h-full">
                  <CardContent className="p-8 text-center space-y-6 h-full flex flex-col">
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto`}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: [0, -10, 10, 0],
                        transition: { duration: 0.3 }
                      }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed flex-grow">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
              </motion.div>
          ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Start free and upgrade as your wellness journey grows. All plans include our core AI features.
          </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                variants={itemVariants}
                whileHover={{ 
                  y: -10,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
            <Card 
                  className={`relative border-2 transition-all duration-500 h-full ${
                    plan.popular 
                      ? 'border-blue-500 shadow-2xl bg-white dark:bg-slate-800' 
                      : 'border-gray-200 hover:border-blue-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm'
              }`}
            >
              {plan.popular && (
                    <motion.div 
                      className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                    >
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                    </motion.div>
                  )}
                  
                  <CardContent className="p-8 space-y-6 h-full flex flex-col">
                    <div className="text-center space-y-4">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{plan.description}</p>
                      <div className="space-y-2">
                        <motion.div 
                          className="text-5xl font-bold text-gray-900 dark:text-white"
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                        >
                      ${plan.price}
                          <span className="text-lg text-gray-500 dark:text-gray-400">/{plan.interval}</span>
                        </motion.div>
                      </div>
                    </div>

                    <ul className="space-y-4 flex-grow">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li 
                          key={feature} 
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + featureIndex * 0.1 + 0.7 }}
                        >
                          <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-white" />
                  </div>
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </motion.li>
                  ))}
                </ul>

                <Link to={isAuthenticated ? "/subscribe" : "/register"} className="block">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                  <Button 
                          className={`w-full py-3 rounded-xl transition-all duration-300 ${
                      plan.popular 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg' 
                              : 'border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600'
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.price === 0 ? 'Get Started' : 'Upgrade Now'}
                  </Button>
                      </motion.div>
                </Link>
              </CardContent>
            </Card>
              </motion.div>
          ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600">
        <motion.div 
          className="max-w-4xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to start your wellness journey?
          </motion.h2>
          <motion.p 
            className="text-xl text-blue-100 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Join thousands of users who trust WellnessAI for their daily wellness support and guidance.
          </motion.p>
          
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
            <Link to="/register">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold"
                  >
                Get Started Today
                    <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
                </motion.div>
            </Link>
            </motion.div>
          )}
        </motion.div>
      </section>
    </div>
  );
};