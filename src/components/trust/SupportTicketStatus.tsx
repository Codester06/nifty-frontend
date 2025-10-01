import React from 'react';
import { Clock, CheckCircle, AlertCircle, MessageCircle, User, Calendar } from 'lucide-react';

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: Date;
  lastUpdated: Date;
  assignedTo?: string;
  messages: number;
  estimatedResolution?: Date;
}

interface SupportTicketStatusProps {
  tickets?: SupportTicket[];
  variant?: 'list' | 'card' | 'compact';
  showDetails?: boolean;
  onTicketClick?: (ticket: SupportTicket) => void;
}

const SupportTicketStatus: React.FC<SupportTicketStatusProps> = ({
  tickets,
  variant = 'list',
  showDetails = true,
  onTicketClick
}) => {
  const defaultTickets: SupportTicket[] = [
    {
      id: 'TKT-001',
      subject: 'Unable to place order for RELIANCE',
      status: 'in-progress',
      priority: 'high',
      category: 'Trading',
      createdAt: new Date('2024-01-15T10:30:00'),
      lastUpdated: new Date('2024-01-15T14:20:00'),
      assignedTo: 'Support Agent Sarah',
      messages: 3,
      estimatedResolution: new Date('2024-01-15T18:00:00')
    },
    {
      id: 'TKT-002',
      subject: 'KYC document verification pending',
      status: 'waiting',
      priority: 'medium',
      category: 'Account',
      createdAt: new Date('2024-01-14T09:15:00'),
      lastUpdated: new Date('2024-01-14T16:45:00'),
      assignedTo: 'KYC Team',
      messages: 2,
      estimatedResolution: new Date('2024-01-16T12:00:00')
    },
    {
      id: 'TKT-003',
      subject: 'Withdrawal not processed',
      status: 'resolved',
      priority: 'high',
      category: 'Wallet',
      createdAt: new Date('2024-01-13T11:20:00'),
      lastUpdated: new Date('2024-01-13T15:30:00'),
      assignedTo: 'Finance Team',
      messages: 5
    }
  ];

  const ticketData = tickets || defaultTickets;

  const getStatusConfig = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return {
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-700',
          icon: AlertCircle,
          label: 'Open'
        };
      case 'in-progress':
        return {
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          icon: Clock,
          label: 'In Progress'
        };
      case 'waiting':
        return {
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-700',
          icon: Clock,
          label: 'Waiting for Response'
        };
      case 'resolved':
        return {
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-700',
          icon: CheckCircle,
          label: 'Resolved'
        };
      case 'closed':
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          icon: CheckCircle,
          label: 'Closed'
        };
      default:
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          icon: AlertCircle,
          label: 'Unknown'
        };
    }
  };

  const getPriorityConfig = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent':
        return {
          color: 'text-red-700 dark:text-red-300',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          label: 'Urgent'
        };
      case 'high':
        return {
          color: 'text-orange-700 dark:text-orange-300',
          bgColor: 'bg-orange-100 dark:bg-orange-900/30',
          label: 'High'
        };
      case 'medium':
        return {
          color: 'text-yellow-700 dark:text-yellow-300',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          label: 'Medium'
        };
      case 'low':
        return {
          color: 'text-green-700 dark:text-green-300',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          label: 'Low'
        };
      default:
        return {
          color: 'text-gray-700 dark:text-gray-300',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          label: 'Normal'
        };
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Support Tickets
        </h3>
        
        <div className="space-y-2">
          {ticketData.slice(0, 3).map((ticket) => {
            const statusConfig = getStatusConfig(ticket.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => onTicketClick?.(ticket)}
              >
                <div className="flex items-center space-x-2">
                  <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {ticket.id}
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-32">
                      {ticket.subject}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ticketData.map((ticket) => {
          const statusConfig = getStatusConfig(ticket.status);
          const priorityConfig = getPriorityConfig(ticket.priority);
          const StatusIcon = statusConfig.icon;
          
          return (
            <div
              key={ticket.id}
              className={`rounded-lg border p-4 cursor-pointer hover:shadow-md transition-all ${statusConfig.bgColor} ${statusConfig.borderColor}`}
              onClick={() => onTicketClick?.(ticket)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {ticket.id}
                  </span>
                </div>
                
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityConfig.bgColor} ${priorityConfig.color}`}>
                  {priorityConfig.label}
                </span>
              </div>
              
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                {ticket.subject}
              </h4>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Category:</span>
                  <span>{ticket.category}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Messages:</span>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{ticket.messages}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Updated:</span>
                  <span>{getTimeAgo(ticket.lastUpdated)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Default list variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Support Tickets
      </h2>
      
      <div className="space-y-4">
        {ticketData.map((ticket) => {
          const statusConfig = getStatusConfig(ticket.status);
          const priorityConfig = getPriorityConfig(ticket.priority);
          const StatusIcon = statusConfig.icon;
          
          return (
            <div
              key={ticket.id}
              className={`rounded-lg border p-4 cursor-pointer hover:shadow-md transition-all ${statusConfig.bgColor} ${statusConfig.borderColor}`}
              onClick={() => onTicketClick?.(ticket)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                    <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {ticket.id}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityConfig.bgColor} ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {ticket.subject}
                    </p>
                  </div>
                </div>
                
                <span className={`px-3 py-1 text-sm font-medium rounded-lg ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}>
                  {statusConfig.label}
                </span>
              </div>
              
              {showDetails && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Category:</span>
                    <div className="mt-1">{ticket.category}</div>
                  </div>
                  
                  <div>
                    <span className="font-medium">Assigned to:</span>
                    <div className="flex items-center space-x-1 mt-1">
                      <User className="h-3 w-3" />
                      <span>{ticket.assignedTo || 'Unassigned'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium">Messages:</span>
                    <div className="flex items-center space-x-1 mt-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{ticket.messages}</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium">Last Updated:</span>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{getTimeAgo(ticket.lastUpdated)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {ticket.estimatedResolution && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Estimated resolution: {ticket.estimatedResolution.toLocaleDateString()} at {ticket.estimatedResolution.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {ticketData.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Support Tickets
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have any active support tickets. If you need help, feel free to contact us!
          </p>
        </div>
      )}
    </div>
  );
};

export default SupportTicketStatus;