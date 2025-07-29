import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { NavBar } from '../components/NavBar';
import { 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Shield, 
  Search,
  Crown,
  Calendar
} from 'lucide-react';
import { formatDate, formatTokenUsage } from '../lib/utils';

// Mock data - in a real app, these would come from your API
const mockStats = {
  totalUsers: 1247,
  activeUsers: 892,
  totalMessages: 45632,
  totalTokens: 2840000,
  monthlyGrowth: 23.5,
};

const mockUsers = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    tier: 'premium',
    joinDate: '2024-01-15',
    lastActive: '2024-01-28',
    messagesCount: 342,
    tokensUsed: 45000,
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    tier: 'free',
    joinDate: '2024-01-20',
    lastActive: '2024-01-27',
    messagesCount: 89,
    tokensUsed: 12000,
  },
  {
    id: '3',
    name: 'Carol Williams',
    email: 'carol@example.com',
    tier: 'business',
    joinDate: '2024-01-10',
    lastActive: '2024-01-28',
    messagesCount: 756,
    tokensUsed: 120000,
  },
];

const mockMessages = [
  {
    id: '1',
    userId: '1',
    userName: 'Alice Johnson',
    content: 'Can you help me create a meditation routine?',
    response: 'I\'d be happy to help you create a personalized meditation routine...',
    timestamp: '2024-01-28T10:30:00Z',
    tokens: 150,
  },
  {
    id: '2',
    userId: '2',
    userName: 'Bob Smith',
    content: 'What are some healthy breakfast options?',
    response: 'Here are some nutritious breakfast ideas that can help start your day...',
    timestamp: '2024-01-28T09:15:00Z',
    tokens: 180,
  },
];

export const Admin = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'messages'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMessages = mockMessages.filter(message =>
    message.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'premium': return 'default';
      case 'business': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/10">
      <NavBar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor system usage, manage users, and view analytics
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'messages', label: 'Messages', icon: MessageCircle },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id as any)}
                className="gap-2"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</p>
                      </div>
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Users</p>
                        <p className="text-2xl font-bold">{mockStats.activeUsers.toLocaleString()}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-wellness" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Messages</p>
                        <p className="text-2xl font-bold">{mockStats.totalMessages.toLocaleString()}</p>
                      </div>
                      <MessageCircle className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tokens Used</p>
                        <p className="text-2xl font-bold">{formatTokenUsage(mockStats.totalTokens)}</p>
                      </div>
                      <Crown className="w-8 h-8 text-wellness" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockMessages.slice(0, 3).map((message) => (
                      <div key={message.id} className="border-l-2 border-primary/20 pl-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{message.userName}</p>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {message.content}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {message.tokens} tokens
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Users Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <p className="font-medium">{user.name}</p>
                            <Badge variant={getTierBadgeVariant(user.tier)} className="capitalize">
                              {user.tier}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {formatDate(user.joinDate)} • Last active {formatDate(user.lastActive)}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-medium">{user.messagesCount} messages</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTokenUsage(user.tokensUsed)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <Card key={message.id}>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <p className="font-medium">{message.userName}</p>
                          <Badge variant="outline">{message.tokens} tokens</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground mb-1">User:</p>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        
                        <div className="p-3 bg-primary/5 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Assistant:</p>
                          <p className="text-sm">{message.response}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};