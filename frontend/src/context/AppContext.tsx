import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = "http://localhost:8000";

export interface User {
  name: string;
  email: string;
  role: 'citizen' | 'admin';
  token: string;
}

export interface CivicIssue {
  id: string;
  category: string;
  description: string;
  image_url?: string;
  location: {
    lat: number;
    lng: number;
    zone: string;
  };
  status: 'submitted' | 'under_review' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  ai_confidence?: number;
  createdAt: string;
  reported_by?: string;
}

export interface EmergencySOS {
  id: string;
  type: 'medical' | 'fire' | 'accident' | 'crime';
  location: {
    lat: number;
    lng: number;
    zone: string;
  };
  status: 'pending' | 'accepted' | 'responding' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export interface TrafficData {
  id: string;
  area: string;
  congestion: 'Low' | 'Medium' | 'High';
  risk_score: number;
  alternate_route: string;
  weather: string;
  time: string;
}

export interface SystemNotification {
  id: string;
  message: string;
  type: 'issue' | 'emergency' | 'resolution';
  createdAt: string;
}

export interface AnalyticsStats {
  metrics: {
    openIssues: number;
    resolvedIssues: number;
    totalIssues: number;
    activeEmergencies: number;
    resolvedEmergencies: number;
    totalEmergencies: number;
    highTrafficZones: number;
    averageResponseTimeMinutes: number;
  };
  charts: {
    issueDistribution: { name: string; value: number }[];
    emergencyDistribution: { name: string; value: number }[];
    trafficCongestion: { name: string; value: number }[];
  };
}

interface AppContextType {
  user: User | null;
  issues: CivicIssue[];
  emergencies: EmergencySOS[];
  trafficReports: TrafficData[];
  notifications: SystemNotification[];
  stats: AnalyticsStats | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, role: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchIssues: () => Promise<void>;
  fetchEmergencies: () => Promise<void>;
  fetchTrafficReports: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchStats: () => Promise<void>;
  reportIssue: (category: string, description: string, imageBase64: string | null, zoneName: string, lat: number, lng: number) => Promise<CivicIssue | null>;
  triggerSOS: (type: 'medical' | 'fire' | 'accident' | 'crime', zoneName: string, lat: number, lng: number) => Promise<EmergencySOS | null>;
  updateIssueStatus: (issueId: string, status?: string, priority?: string) => Promise<void>;
  updateEmergencyStatus: (emergencyId: string, status: string) => Promise<void>;
  predictTraffic: (area: string, time: string, weather: string) => Promise<TrafficData | null>;
  clearNotifications: () => Promise<void>;
  sendChatMessage: (message: string) => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('trinetra_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencySOS[]>([]);
  const [trafficReports, setTrafficReports] = useState<TrafficData[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // General request headers helper
  const getHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      ...(user ? { 'Authorization': `Bearer ${user.token}` } : {})
    };
  }, [user]);

  // Auth functions
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        throw new Error("Invalid email or password");
      }
      const data = await response.json();
      const authenticatedUser: User = {
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.access_token
      };
      setUser(authenticatedUser);
      localStorage.setItem('trinetra_user', JSON.stringify(authenticatedUser));
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to log in");
      setLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, role: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Registration failed");
      }
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to register");
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('trinetra_user');
    setIssues([]);
    setEmergencies([]);
    setNotifications([]);
    setStats(null);
  };

  // Fetch functions
  const fetchIssues = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/issues`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setIssues(data);
      }
    } catch (err) {
      console.error("Error fetching issues:", err);
    }
  }, [getHeaders]);

  const fetchEmergencies = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/emergencies`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setEmergencies(data);
      }
    } catch (err) {
      console.error("Error fetching emergencies:", err);
    }
  }, [getHeaders]);

  const fetchTrafficReports = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/traffic`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setTrafficReports(data);
      }
    } catch (err) {
      console.error("Error fetching traffic:", err);
    }
  }, [getHeaders]);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/notifications`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [getHeaders]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics/stats`, { headers: getHeaders() });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching analytics stats:", err);
    }
  }, [getHeaders]);

  // Operations
  const reportIssue = async (
    category: string,
    description: string,
    imageBase64: string | null,
    zoneName: string,
    lat: number,
    lng: number
  ): Promise<CivicIssue | null> => {
    try {
      const response = await fetch(`${API_BASE}/issues/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          category,
          description,
          image_url: imageBase64,
          location: { lat, lng, zone: zoneName }
        })
      });
      if (response.ok) {
        const newIssue = await response.json();
        setIssues(prev => [newIssue, ...prev]);
        // Trigger quick refresh of stats & notifications
        fetchStats();
        fetchNotifications();
        return newIssue;
      }
    } catch (err) {
      console.error("Error reporting civic issue:", err);
    }
    return null;
  };

  const triggerSOS = async (
    type: 'medical' | 'fire' | 'accident' | 'crime',
    zoneName: string,
    lat: number,
    lng: number
  ): Promise<EmergencySOS | null> => {
    try {
      const response = await fetch(`${API_BASE}/emergencies/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          type,
          location: { lat, lng, zone: zoneName }
        })
      });
      if (response.ok) {
        const newEmergency = await response.json();
        setEmergencies(prev => [newEmergency, ...prev]);
        fetchStats();
        fetchNotifications();
        return newEmergency;
      }
    } catch (err) {
      console.error("Error triggering SOS:", err);
    }
    return null;
  };

  const updateIssueStatus = async (issueId: string, status?: string, priority?: string) => {
    try {
      const response = await fetch(`${API_BASE}/issues/${issueId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, priority })
      });
      if (response.ok) {
        await fetchIssues();
        await fetchStats();
        await fetchNotifications();
      }
    } catch (err) {
      console.error("Error updating issue:", err);
    }
  };

  const updateEmergencyStatus = async (emergencyId: string, status: string) => {
    try {
      const response = await fetch(`${API_BASE}/emergencies/${emergencyId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        await fetchEmergencies();
        await fetchStats();
        await fetchNotifications();
      }
    } catch (err) {
      console.error("Error updating emergency:", err);
    }
  };

  const predictTraffic = async (area: string, time: string, weather: string): Promise<TrafficData | null> => {
    try {
      const response = await fetch(`${API_BASE}/traffic/predict`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ area, time, weather })
      });
      if (response.ok) {
        const newPrediction = await response.json();
        setTrafficReports(prev => [newPrediction, ...prev]);
        fetchStats();
        return newPrediction;
      }
    } catch (err) {
      console.error("Error predicting traffic:", err);
    }
    return null;
  };

  const clearNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE}/notifications/clear`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (response.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  const sendChatMessage = async (message: string): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message })
      });
      if (response.ok) {
        const data = await response.json();
        // Reload dashboard
        fetchIssues();
        fetchEmergencies();
        return data.response;
      }
    } catch (err) {
      console.error("Error chatting with TRINETRA AI:", err);
    }
    return "Connection interrupted. TRINETRA Core unable to compile query response.";
  };

  // Data pre-loading on authentication & regular polling interval
  useEffect(() => {
    if (user) {
      // Immediate fetch
      fetchIssues();
      fetchEmergencies();
      fetchTrafficReports();
      fetchNotifications();
      fetchStats();

      // Poll every 3 seconds for active command center responsiveness
      const interval = setInterval(() => {
        fetchIssues();
        fetchEmergencies();
        fetchTrafficReports();
        fetchNotifications();
        fetchStats();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [user, fetchIssues, fetchEmergencies, fetchTrafficReports, fetchNotifications, fetchStats]);

  return (
    <AppContext.Provider value={{
      user, issues, emergencies, trafficReports, notifications, stats, loading, error,
      login, register, logout, fetchIssues, fetchEmergencies, fetchTrafficReports,
      fetchNotifications, fetchStats, reportIssue, triggerSOS, updateIssueStatus,
      updateEmergencyStatus, predictTraffic, clearNotifications, sendChatMessage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
