import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings, BarChart3 } from 'lucide-react';
import { PermissionGate } from '@/components/auth/permission-gate';
import { NotificationLogs } from '@/components/admin/notifications/notification-logs';
import { NotificationStats } from '@/components/admin/notifications/notification-stats';
import { CreateNotificationForm } from '@/components/admin/notifications/create-notification-form';
import { useToast } from '@/components/ui/use-toast';

export default function AdminNotificationsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const [refreshLogs, setRefreshLogs] = useState(0);

  const handleNotificationSent = () => {
    toast({
      title: 'Notification Sent',
      description: 'Custom notification has been sent successfully.',
    });
    setRefreshLogs(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Management</h1>
          <p className="text-muted-foreground">
            Create and manage custom notifications for users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PermissionGate requiredPermission="settings.smtp">
            <Button
              variant="outline"
              onClick={() => navigate('/settings/smtp')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Email Settings
            </Button>
          </PermissionGate>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Notification
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Notification Logs
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Notification</CardTitle>
              <CardDescription>
                Send custom notifications to selected users or groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateNotificationForm onNotificationSent={handleNotificationSent} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>
                View all notifications sent through the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationLogs key={refreshLogs} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Analytics</CardTitle>
              <CardDescription>
                Statistics and insights about notification activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationStats />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
