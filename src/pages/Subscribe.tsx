import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { NavBar } from '../components/NavBar';
import { Check, Crown, Zap, Building, Loader2 } from 'lucide-react';
import { subscriptionApi, Plan, Subscription } from '../api/subscription';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export const Subscribe = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscribingTo, setSubscribingTo] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, subscriptionData] = await Promise.all([
        subscriptionApi.getPlans(),
        subscriptionApi.getCurrentSubscription(),
      ]);
      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setSubscribingTo(planId);
    try {
      const { url } = await subscriptionApi.createCheckoutSession(planId);
      // Open Stripe checkout in new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      toast.error('Failed to start checkout process');
    } finally {
      setSubscribingTo(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { url } = await subscriptionApi.createPortalSession();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      toast.error('Failed to open subscription management');
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'premium': return Crown;
      case 'business': return Building;
      default: return Zap;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/10">
        <NavBar />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/10">
      <NavBar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Choose Your Plan</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock the full potential of your wellness journey with our flexible subscription plans.
            </p>
          </div>

          {/* Current Subscription Status */}
          {currentSubscription && (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-wellness/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Current Plan: {user?.tier}</h3>
                    <p className="text-muted-foreground">
                      Status: <span className="capitalize text-primary">{currentSubscription.status}</span>
                    </p>
                    {currentSubscription.currentPeriodEnd && (
                      <p className="text-sm text-muted-foreground">
                        Next billing: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button onClick={handleManageSubscription} variant="outline">
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const Icon = getPlanIcon(plan.name);
              const isCurrentPlan = currentSubscription?.planId === plan.id;
              const isFreePlan = plan.price === 0;
              
              return (
                <Card 
                  key={plan.id}
                  className={`relative border-2 transition-all duration-300 hover:shadow-glow ${
                    plan.popular ? 'border-primary shadow-glow' : 'border-border'
                  } ${isCurrentPlan ? 'ring-2 ring-primary/20' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-primary to-wellness text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <Badge variant="secondary">Current Plan</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center space-y-4">
                    <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center ${
                      plan.popular ? 'bg-gradient-to-r from-primary to-wellness' : 'bg-muted'
                    }`}>
                      <Icon className={`w-6 h-6 ${plan.popular ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    
                    <div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="mt-2">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/{plan.interval}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Messages</span>
                        <span className="font-medium">
                          {plan.messagesLimit === -1 ? 'Unlimited' : plan.messagesLimit.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tokens</span>
                        <span className="font-medium">
                          {plan.tokensLimit === -1 ? 'Unlimited' : plan.tokensLimit.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <Button
                      className={`w-full ${
                        plan.popular && !isCurrentPlan
                          ? 'bg-gradient-to-r from-primary to-wellness hover:opacity-90'
                          : ''
                      }`}
                      variant={plan.popular && !isCurrentPlan ? 'default' : 'outline'}
                      disabled={isCurrentPlan || subscribingTo === plan.id}
                      onClick={() => !isCurrentPlan && handleSubscribe(plan.id)}
                    >
                      {subscribingTo === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : isFreePlan ? (
                        'Current Plan'
                      ) : (
                        `Upgrade to ${plan.name}`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* FAQ or Additional Info */}
          <div className="text-center space-y-4 pt-12">
            <h3 className="text-2xl font-semibold">Need help choosing?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              All plans include our core AI wellness features. Start with Free to explore, 
              then upgrade when you need more capabilities. You can change or cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};