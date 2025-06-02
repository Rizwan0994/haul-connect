import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, TrendingUp, DollarSign } from 'lucide-react';
import { Dispatch } from '@/lib/dispatch-api';

interface TopDispatchersProps {
  dispatches: Dispatch[];
  loading?: boolean;
}

interface DispatcherStats {
  name: string;
  loadCount: number;
  totalCommission: number;
  deliveredLoads: number;
  initials: string;
}

export function TopDispatchers({ dispatches, loading }: TopDispatchersProps) {
  const calculateDispatcherStats = (): DispatcherStats[] => {
    const dispatcherMap = new Map<string, DispatcherStats>();

    dispatches.forEach(dispatch => {
      const dispatcherName = dispatch.dispatcher || 'Unknown';
      const commission = (dispatch.load_amount * 8) / 100;
      const isDelivered = dispatch.status === 'Delivered';

      if (!dispatcherMap.has(dispatcherName)) {
        const nameParts = dispatcherName.split(' ');
        const initials = nameParts.length >= 2 
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
          : dispatcherName.substring(0, 2).toUpperCase();

        dispatcherMap.set(dispatcherName, {
          name: dispatcherName,
          loadCount: 0,
          totalCommission: 0,
          deliveredLoads: 0,
          initials
        });
      }

      const stats = dispatcherMap.get(dispatcherName)!;
      stats.loadCount += 1;
      stats.totalCommission += commission;
      if (isDelivered) {
        stats.deliveredLoads += 1;
      }
    });

    // Sort by load count (primary) and commission (secondary)
    return Array.from(dispatcherMap.values())
      .sort((a, b) => {
        if (b.loadCount !== a.loadCount) {
          return b.loadCount - a.loadCount;
        }
        return b.totalCommission - a.totalCommission;
      })
      .slice(0, 5); // Top 5 dispatchers
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const dispatchers = calculateDispatcherStats();

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-5 bg-gray-200 rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Top Dispatchers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dispatchers.length > 0 ? (
            dispatchers.map((dispatcher, index) => (
              <div
                key={dispatcher.name}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={dispatcher.name} />
                      <AvatarFallback className="text-sm font-semibold">
                        {dispatcher.initials}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1">
                        <Crown className="h-4 w-4 text-yellow-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white-900">{dispatcher.name}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {dispatcher.loadCount} loads
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(dispatcher.totalCommission)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={index === 0 ? "default" : "secondary"}
                    className={index === 0 ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : ""}
                  >
                    #{index + 1}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {dispatcher.deliveredLoads} delivered
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No dispatcher data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
