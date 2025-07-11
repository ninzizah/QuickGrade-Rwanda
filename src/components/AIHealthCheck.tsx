import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const AIHealthCheck: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<{
    status: 'loading' | 'healthy' | 'error';
    message: string;
  }>({ status: 'loading', message: 'Checking AI service...' });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get('/api/ai/health');
        setHealthStatus({
          status: response.data.status === 'healthy' ? 'healthy' : 'error',
          message: response.data.message
        });
      } catch (error: any) {
        setHealthStatus({
          status: 'error',
          message: error.response?.data?.message || 'AI service unavailable'
        });
      }
    };

    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = () => {
    switch (healthStatus.status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    switch (healthStatus.status) {
      case 'loading':
        return 'text-blue-600';
      case 'healthy':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      {getIcon()}
      <span className={getStatusColor()}>
        AI Service: {healthStatus.message}
      </span>
    </div>
  );
};

export default AIHealthCheck;