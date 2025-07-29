import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { NavBar } from '../components/NavBar';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { User, Crown, MessageCircle, Zap, Calendar, Save, Upload } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUsageStore } from '../store/usageStore';
import { authApi } from '../api/auth';
import { usageApi } from '../api/usage';
import { formatTokenUsage } from '../lib/utils';
import { toast } from 'sonner';

export const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const { stats, setStats, setLoading } = useUsageStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsageStats();
  }, []);

  const loadUsageStats = async () => {
    setLoading(true);
    try {
      const usageData = await usageApi.getUsage();
      setStats(usageData);
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedUser = await authApi.updateProfile(formData);
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a service like S3
      toast.success('Avatar upload functionality would be implemented here');
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium':
      case 'business':
        return Crown;
      default:
        return User;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'bg-gradient-to-r from-primary to-wellness';
      case 'business': return 'bg-gradient-to-r from-primary to-purple-600';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/10">
      <NavBar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground">
              Manage your profile, subscription, and usage statistics
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Settings */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {user?.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Change Avatar
                          </span>
                        </Button>
                      </Label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG or GIF. Max size 2MB.
                      </p>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-gradient-to-r from-primary to-wellness hover:opacity-90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Account Status & Usage */}
            <div className="space-y-6">
              {/* Subscription Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTierColor(user?.tier || 'free')}`}>
                        {(() => {
                          const TierIcon = getTierIcon(user?.tier || 'free');
                          return <TierIcon className="w-4 h-4 text-white" />;
                        })()}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{user?.tier} Plan</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.tier === 'free' ? 'Limited features' : 'Full access'}
                        </p>
                      </div>
                    </div>

                    {user?.tier === 'free' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => window.location.href = '/subscribe'}
                      >
                        Upgrade Plan
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Usage This Month
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats ? (
                    <>
                      {/* Messages */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Messages
                          </span>
                          <span className="font-medium">
                            {stats.messagesUsed} / {stats.messagesLimit === -1 ? '∞' : stats.messagesLimit}
                          </span>
                        </div>
                        {stats.messagesLimit !== -1 && (
                          <Progress 
                            value={(stats.messagesUsed / stats.messagesLimit) * 100} 
                            className="h-2"
                          />
                        )}
                      </div>

                      {/* Tokens */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Tokens
                          </span>
                          <span className="font-medium">
                            {formatTokenUsage(stats.tokensUsed)} / {stats.tokensLimit === -1 ? '∞' : formatTokenUsage(stats.tokensLimit)}
                          </span>
                        </div>
                        {stats.tokensLimit !== -1 && (
                          <Progress 
                            value={(stats.tokensUsed / stats.tokensLimit) * 100} 
                            className="h-2"
                          />
                        )}
                      </div>

                      {/* Reset Date */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                        <Calendar className="w-3 h-3" />
                        Resets on {new Date(stats.resetDate).toLocaleDateString()}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">Loading usage data...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};