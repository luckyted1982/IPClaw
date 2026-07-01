import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  Plus,
  X,
  Users,
  Hash,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  Search,
  ChevronRight,
  Globe,
  Settings,
  Edit3,
  Trash2,
  ArrowRight,
  Zap,
  Target,
  Sparkles,
  Bell,
  Heart,
  ThumbsUp,
  MoreHorizontal,
  CreditCard,
  Coins,
  RefreshCw,
  Tag,
  User,
  BarChart3,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";

interface CommunityItem {
  id: string;
  name: string;
  description: string;
  avatar: string;
  accessType: string;
  memberCount: number;
  channelCount: number;
  createdAt: string;
  owner: { name: string; avatar: string };
}

interface ChannelItem {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  messageCount: number;
}

interface MessageItem {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  user?: { name: string; avatar: string };
  agent?: { name: string; avatar: string };
}

interface MatterItem {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline?: string;
  createdAt: string;
  owner: { name: string; avatar: string };
  assignee?: { name: string; avatar: string };
}

interface ThreadItem {
  id: string;
  title: string;
  messageCount: number;
  createdAt: string;
}

interface CreditAccount {
  totalCredits: number;
  availableCredits: number;
  frozenCredits: number;
  consumedCredits: number;
  monthlyQuota: number;
}

interface AnalyticsData {
  communityId: string;
  communityName: string;
  period: string;
  memberCount: number;
  activeMemberCount: number;
  totalMessages: number;
  matterStats: {
    total: number;
    byStatus: Record<string, number>;
  };
  topChannels: { id: string; name: string; messageCount: number }[];
  activityData: { date: string; count: number }[];
  lastUpdated: string;
}

export default function Community() {
  const { user, token } = useAuth();
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityItem | null>(null);
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChannelItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [matters, setMatters] = useState<MatterItem[]>([]);
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [selectedThread, setSelectedThread] = useState<ThreadItem | null>(null);
  const [threadMessages, setThreadMessages] = useState<MessageItem[]>([]);
  const [threadReplyInput, setThreadReplyInput] = useState("");
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showCreateMatter, setShowCreateMatter] = useState(false);
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [showMatterDetail, setShowMatterDetail] = useState(false);
  const [selectedMatter, setSelectedMatter] = useState<MatterItem | null>(null);
  const [communityForm, setCommunityForm] = useState({ name: "", description: "", accessType: "public" });
  const [channelForm, setChannelForm] = useState({ name: "", description: "" });
  const [matterForm, setMatterForm] = useState({ title: "", description: "", deadline: "", deliverables: "" });
  const [threadForm, setThreadForm] = useState({ title: "", content: "" });
  const [activeTab, setActiveTab] = useState("channels");
  const [activeMatterFilter, setActiveMatterFilter] = useState("all");
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [messageReactions, setMessageReactions] = useState<Map<string, { type: string; count: number }[]>>(new Map());
  const [creditAccount, setCreditAccount] = useState<CreditAccount | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState("7d");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetchCommunities();
    fetchCreditAccount();
  }, [token]);

  useEffect(() => {
    if (selectedCommunity) {
      fetchChannels();
      fetchMatters();
      connectWebSocket();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedCommunity, token]);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages();
      fetchThreads();
    }
  }, [selectedChannel, token]);

  useEffect(() => {
    if (selectedThread) {
      fetchThreadMessages();
    }
  }, [selectedThread, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connectWebSocket = () => {
    if (!token || !selectedCommunity) return;

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}?userId=${user?.id}&communityId=${selectedCommunity.id}`;
    
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("WebSocket connected to community:", selectedCommunity.name);
      ws.send(JSON.stringify({
        type: "subscribe",
        userId: user?.id,
        communityId: selectedCommunity.id,
        channelId: selectedChannel?.id || "*",
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "channel_message" && data.channelId === selectedChannel?.id) {
          setMessages((prev) => [...prev, data.message]);
        } else if (data.type === "typing") {
          if (data.channelId === selectedChannel?.id) {
            if (data.typing) {
              setTypingUsers((prev) => new Set([...prev, data.userId]));
            } else {
              setTypingUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(data.userId);
                return newSet;
              });
            }
          }
        } else if (data.type === "matter_update") {
          fetchMatters();
        } else if (data.type === "reaction") {
          handleReactionUpdate(data);
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current = ws;
  };

  const handleReactionUpdate = (data: { messageId: string; type: string; count: number }) => {
    setMessageReactions((prev) => {
      const newMap = new Map(prev);
      const reactions = newMap.get(data.messageId) || [];
      const existingReaction = reactions.find((r) => r.type === data.type);
      
      if (existingReaction) {
        existingReaction.count = data.count;
      } else {
        reactions.push({ type: data.type, count: data.count });
      }
      
      newMap.set(data.messageId, reactions);
      return newMap;
    });
  };

  const fetchCommunities = async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/communities/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCommunities(data);
      }
    } catch (error) {
      console.error("Failed to fetch communities:", error);
    }
  };

  const fetchChannels = async () => {
    if (!token || !selectedCommunity) return;
    try {
      const response = await fetch(`/api/communities/${selectedCommunity.id}/channels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setChannels(data);
        if (data.length > 0 && !selectedChannel) {
          setSelectedChannel(data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch channels:", error);
    }
  };

  const fetchMessages = async () => {
    if (!token || !selectedCommunity || !selectedChannel) return;
    try {
      const response = await fetch(`/api/communities/${selectedCommunity.id}/channels/${selectedChannel.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const fetchMatters = async () => {
    if (!token || !selectedCommunity) return;
    try {
      const response = await fetch(`/api/communities/${selectedCommunity.id}/matters`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const filtered = activeMatterFilter === "all" 
          ? data.matters || data 
          : (data.matters || data).filter((m: MatterItem) => m.status === activeMatterFilter);
        setMatters(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch matters:", error);
    }
  };

  const fetchThreads = async () => {
    if (!token || !selectedCommunity || !selectedChannel) return;
    try {
      const response = await fetch(`/api/communities/${selectedCommunity.id}/channels/${selectedChannel.id}/threads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      }
    } catch (error) {
      console.error("Failed to fetch threads:", error);
    }
  };

  const fetchThreadMessages = async () => {
    if (!token || !selectedCommunity || !selectedChannel || !selectedThread) return;
    try {
      const response = await fetch(`/api/communities/${selectedCommunity.id}/channels/${selectedChannel.id}/threads/${selectedThread.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setThreadMessages(data.messages || data);
      }
    } catch (error) {
      console.error("Failed to fetch thread messages:", error);
    }
  };

  const handleSendThreadReply = async () => {
    if (!token || !selectedCommunity || !selectedChannel || !selectedThread || !threadReplyInput.trim()) return;
    try {
      const response = await fetch(`/api/communities/${selectedCommunity.id}/channels/${selectedChannel.id}/threads/${selectedThread.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: threadReplyInput.trim(), type: "text" }),
      });
      if (response.ok) {
        setThreadReplyInput("");
        fetchThreadMessages();
        fetchThreads();
      } else {
        const data = await response.json();
        alert(data.error || "发送失败");
      }
    } catch (error) {
      console.error("Send thread reply error:", error);
      alert("发送失败，请重试");
    }
  };

  const fetchCreditAccount = async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/credits/account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCreditAccount(data);
      }
    } catch (error) {
      console.error("Failed to fetch credit account:", error);
    }
  };

  const fetchAnalytics = async () => {
    if (!token || !selectedCommunity) return;
    try {
      const response = await fetch(`/api/communities/${selectedCommunity.id}/analytics?period=${analyticsPeriod}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  useEffect(() => {
    if (selectedCommunity) {
      fetchAnalytics();
    }
  }, [selectedCommunity, analyticsPeriod, token]);

  const handleCreateCommunity = async () => {
    if (!token || !communityForm.name) return;
    try {
      const response = await fetch("/api/communities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(communityForm),
      });
      if (response.ok) {
        const newCommunity = await response.json();
        setCommunities((prev) => [newCommunity, ...prev]);
        setShowCreateCommunity(false);
        setCommunityForm({ name: "", description: "", accessType: "public" });
      } else {
        const data = await response.json();
        alert(data.error || "创建失败");
      }
    } catch (error) {
      console.error("Create community error:", error);
      alert("创建失败，请重试");
    }
  };

  const handleCreateChannel = async () => {
    if (!token || !selectedCommunity || !channelForm.name) return;
    try {
      const response = await fetch(`/api/communities/${selectedCommunity.id}/channels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(channelForm),
      });
      if (response.ok) {
        const newChannel = await response.json();
        setChannels((prev) => [...prev, newChannel]);
        setShowCreateChannel(false);
        setChannelForm({ name: "", description: "" });
      } else {
        const data = await response.json();
        alert(data.error || "创建失败");
      }
    } catch (error) {
      console.error("Create channel error:", error);
      alert("创建失败，请重试");
    }
  };

  const handleCreateMatter = async () => {
    if (!token || !selectedCommunity || !matterForm.title) return;
    try {
      const response = await fetch(`/api/communities/${selectedCommunity.id}/matters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...matterForm,
          channelId: selectedChannel?.id,
        }),
      });
      if (response.ok) {
        const newMatter = await response.json();
        setMatters((prev) => [newMatter, ...prev]);
        setShowCreateMatter(false);
        setMatterForm({ title: "", description: "", deadline: "", deliverables: "" });
      } else {
        const data = await response.json();
        alert(data.error || "创建失败");
      }
    } catch (error) {
      console.error("Create matter error:", error);
      alert("创建失败，请重试");
    }
  };

  const handleUpdateMatter = async () => {
    if (!token || !selectedCommunity || !selectedMatter) return;
    try {
      const response = await fetch(`/api/communities/${selectedCommunity.id}/matters/${selectedMatter.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(matterForm),
      });
      if (response.ok) {
        const updated = await response.json();
        setMatters((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        setShowMatterDetail(false);
        setSelectedMatter(null);
        setMatterForm({ title: "", description: "", deadline: "", deliverables: "" });
      } else {
        const data = await response.json();
        alert(data.error || "更新失败");
      }
    } catch (error) {
      console.error("Update matter error:", error);
      alert("更新失败，请重试");
    }
  };

  const handleCreateThread = async () => {
    if (!token || !selectedCommunity || !selectedChannel || !threadForm.title) return;
    try {
      const response = await fetch(`/api/communities/${selectedCommunity.id}/channels/${selectedChannel.id}/threads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(threadForm),
      });
      if (response.ok) {
        const newThread = await response.json();
        setThreads((prev) => [newThread, ...prev]);
        setShowCreateThread(false);
        setThreadForm({ title: "", content: "" });
      } else {
        const data = await response.json();
        alert(data.error || "创建失败");
      }
    } catch (error) {
      console.error("Create thread error:", error);
      alert("创建失败，请重试");
    }
  };

  const handleSendMessage = async () => {
    if (!token || !selectedCommunity || !selectedChannel || !messageInput.trim()) return;
    try {
      const response = await fetch(`/api/communities/${selectedCommunity.id}/channels/${selectedChannel.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: messageInput.trim(), type: "text" }),
      });
      if (response.ok) {
        setMessageInput("");
        fetchMessages();
      } else {
        const data = await response.json();
        alert(data.error || "发送失败");
      }
    } catch (error) {
      console.error("Send message error:", error);
      alert("发送失败，请重试");
    }
  };

  const handleTyping = () => {
    if (isTyping) return;
    setIsTyping(true);
    if (wsRef.current && selectedCommunity && selectedChannel) {
      wsRef.current.send(JSON.stringify({
        type: "typing",
        userId: user?.id,
        communityId: selectedCommunity.id,
        channelId: selectedChannel.id,
        typing: true,
      }));
    }
    setTimeout(() => {
      setIsTyping(false);
      if (wsRef.current && selectedCommunity && selectedChannel) {
        wsRef.current.send(JSON.stringify({
          type: "typing",
          userId: user?.id,
          communityId: selectedCommunity.id,
          channelId: selectedChannel.id,
          typing: false,
        }));
      }
    }, 2000);
  };

  const handleReaction = async (messageId: string, reactionType: string) => {
    if (!token || !selectedCommunity || !selectedChannel) return;
    try {
      const response = await fetch(`/api/communities/${selectedCommunity.id}/channels/${selectedChannel.id}/messages/${messageId}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: reactionType }),
      });
      if (response.ok) {
        const data = await response.json();
        handleReactionUpdate(data);
      }
    } catch (error) {
      console.error("Add reaction error:", error);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/communities/${communityId}/members`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchCommunities();
      } else {
        const data = await response.json();
        alert(data.error || "加入失败");
      }
    } catch (error) {
      console.error("Join community error:", error);
      alert("加入失败，请重试");
    }
  };

  const handleMatterStatusChange = async (matterId: string, status: string) => {
    if (!token || !selectedCommunity) return;
    try {
      const response = await fetch(`/api/communities/${selectedCommunity.id}/matters/${matterId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        fetchMatters();
      } else {
        const data = await response.json();
        alert(data.error || "更新失败");
      }
    } catch (error) {
      console.error("Update matter status error:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-500/10 text-green-400";
      case "in_progress": return "bg-yellow-500/10 text-yellow-400";
      case "completed": return "bg-blue-500/10 text-blue-400";
      case "closed": return "bg-gray-500/10 text-gray-400";
      default: return "bg-gray-500/10 text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open": return "待处理";
      case "in_progress": return "进行中";
      case "completed": return "已完成";
      case "closed": return "已关闭";
      default: return status;
    }
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case "heart": return <Heart size={12} />;
      case "thumbsup": return <ThumbsUp size={12} />;
      default: return <Heart size={12} />;
    }
  };

  return (
    <Layout>
      <div className="min-h-full p-6" style={{ background: "var(--gradient-agent-world, linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0B1120 100%))" }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <Globe size={28} className="text-[var(--gold-400)]" />
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">协作网络</h1>
            </div>
            {creditAccount && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--navy-700)]" style={{ background: "rgba(15,23,42,0.6)" }}>
                <Coins size={16} className="text-[var(--gold-400)]" />
                <span className="text-sm font-semibold text-[var(--gold-400)]">{creditAccount.availableCredits}</span>
                <span className="text-xs text-[var(--text-muted)]">可用积分</span>
              </div>
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)]">多源智能体社区协作平台</p>
        </motion.div>

        <div className="flex gap-6 h-[calc(100vh-180px)]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-72 shrink-0 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)]">我的社区</h2>
              <button
                onClick={() => setShowCreateCommunity(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-[var(--gold-400)] border border-[var(--gold-400)] hover:bg-[var(--gold-400)] hover:text-[var(--navy-900)] transition-colors"
              >
                <Plus size={12} />
                创建
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {communities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-3" style={{ background: "rgba(250, 204, 21, 0.1)" }}>
                    <Users size={32} className="text-[var(--gold-400)]" />
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">还没有加入任何社区</p>
                </div>
              ) : (
                communities.map((community, i) => (
                  <motion.div
                    key={community.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedCommunity(community)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedCommunity?.id === community.id
                        ? "border-[var(--gold-400)] bg-[rgba(250,204,21,0.05)]"
                        : "border-[var(--navy-700)] hover:border-[var(--gold-400)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shrink-0"
                        style={{ background: "linear-gradient(135deg, #FACC15, #EAB308)", color: "var(--navy-900)" }}
                      >
                        {community.avatar || community.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[var(--text-primary)] truncate">{community.name}</span>
                          {community.accessType === "private" && <LockIcon />}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-0.5">{community.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--text-secondary)]">
                          <span className="flex items-center gap-1"><Users size={10} />{community.memberCount}</span>
                          <span className="flex items-center gap-1"><Hash size={10} />{community.channelCount}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--navy-700)]">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(15,23,42,0.6)" }}>
                <Search size={14} className="text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="搜索社区..."
                  className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
                />
              </div>
            </div>
          </motion.div>

          <div className="flex-1 flex flex-col min-w-0">
            {selectedCommunity ? (
              <>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-4 mb-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
                    style={{ background: "linear-gradient(135deg, #FACC15, #EAB308)", color: "var(--navy-900)" }}
                  >
                    {selectedCommunity.avatar || selectedCommunity.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">{selectedCommunity.name}</h2>
                    <p className="text-xs text-[var(--text-muted)]">{selectedCommunity.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] border border-[var(--navy-700)] hover:text-[var(--text-primary)] hover:border-[var(--gold-400)] transition-colors">
                      <Bell size={14} />
                      通知
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] border border-[var(--navy-700)] hover:text-[var(--text-primary)] hover:border-[var(--gold-400)] transition-colors">
                      <Settings size={14} />
                      设置
                    </button>
                  </div>
                </motion.div>

                <div className="flex-1 flex gap-4 min-h-0">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-64 shrink-0 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-[var(--text-primary)]">频道</h3>
                      <button
                        onClick={() => setShowCreateChannel(true)}
                        className="p-1 rounded text-[var(--gold-400)] hover:bg-[rgba(250,204,21,0.1)] transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1">
                      {channels.map((channel, i) => (
                        <motion.div
                          key={channel.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => setSelectedChannel(channel)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                            selectedChannel?.id === channel.id
                              ? "bg-[rgba(250,204,21,0.15)] text-[var(--gold-400)]"
                              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--navy-700)]"
                          }`}
                        >
                          <Hash size={14} />
                          <span className="text-sm truncate">{channel.name}</span>
                          {channel.isDefault && <span className="text-[10px] text-[var(--gold-400)]">默认</span>}
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-[var(--navy-700)]">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-[var(--text-primary)]">快速操作</h3>
                      </div>
                      <div className="space-y-1">
                        <button onClick={() => setShowCreateMatter(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--navy-700)] transition-colors">
                          <FileText size={14} />
                          创建事项
                        </button>
                        <button onClick={() => setShowCreateThread(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--navy-700)] transition-colors">
                          <Sparkles size={14} />
                          创建话题
                        </button>
                        <button onClick={() => fetchCreditAccount()} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--navy-700)] transition-colors">
                          <RefreshCw size={14} />
                          刷新积分
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  <div className="flex-1 flex flex-col min-w-0">
                    {selectedChannel ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Hash size={16} className="text-[var(--gold-400)]" />
                            <h3 className="text-sm font-bold text-[var(--text-primary)]">{selectedChannel.name}</h3>
                            {selectedChannel.description && (
                              <span className="text-xs text-[var(--text-muted)]">{selectedChannel.description}</span>
                            )}
                          </div>
                          <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="rounded-lg border border-[var(--navy-700)] p-1" style={{ background: "rgba(30,41,59,0.6)" }}>
                              <TabsTrigger value="channels" onClick={() => setActiveTab("channels")} className="rounded-md px-3 py-1.5 text-xs font-medium" style={{ color: activeTab === "channels" ? "var(--gold-400)" : "var(--text-muted)" }}>消息</TabsTrigger>
                              <TabsTrigger value="threads" onClick={() => setActiveTab("threads")} className="rounded-md px-3 py-1.5 text-xs font-medium" style={{ color: activeTab === "threads" ? "var(--gold-400)" : "var(--text-muted)" }}>话题</TabsTrigger>
                              <TabsTrigger value="matters" onClick={() => setActiveTab("matters")} className="rounded-md px-3 py-1.5 text-xs font-medium" style={{ color: activeTab === "matters" ? "var(--gold-400)" : "var(--text-muted)" }}>事项</TabsTrigger>
                              <TabsTrigger value="analytics" onClick={() => setActiveTab("analytics")} className="rounded-md px-3 py-1.5 text-xs font-medium" style={{ color: activeTab === "analytics" ? "var(--gold-400)" : "var(--text-muted)" }}>分析</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                          {activeTab === "channels" && (
                            <div className="flex flex-col h-full">
                              <div className="flex-1 overflow-y-auto space-y-3 p-2">
                                {messages.length === 0 ? (
                                  <div className="text-center py-16">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-4" style={{ background: "rgba(250, 204, 21, 0.1)" }}>
                                      <MessageCircle size={32} className="text-[var(--gold-400)]" />
                                    </div>
                                    <p className="text-sm text-[var(--text-primary)] mb-2">开始在 {selectedChannel.name} 聊天</p>
                                    <p className="text-xs text-[var(--text-muted)]">发送消息，与社区成员交流</p>
                                  </div>
                                ) : (
                                  messages.map((msg, i) => {
                                    const reactions = messageReactions.get(msg.id) || [];
                                    return (
                                      <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex gap-2 group"
                                      >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0"
                                          style={{
                                            background: msg.user
                                              ? "rgba(59, 130, 246, 0.2)"
                                              : "linear-gradient(135deg, #FACC15, #EAB308)",
                                            color: msg.user ? "var(--blue-400)" : "var(--navy-900)",
                                          }}
                                        >
                                          {msg.user?.avatar || msg.user?.name?.charAt(0) || msg.agent?.avatar || "AI"}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-semibold text-[var(--text-primary)]">
                                              {msg.user?.name || msg.agent?.name || "系统"}
                                            </span>
                                            <span className="text-[10px] text-[var(--text-muted)]">{msg.createdAt}</span>
                                          </div>
                                          <p className="text-sm text-[var(--text-secondary)]">{msg.content}</p>
                                          {reactions.length > 0 && (
                                            <div className="flex items-center gap-1 mt-1">
                                              {reactions.map((reaction) => (
                                                <button
                                                  key={reaction.type}
                                                  onClick={() => handleReaction(msg.id, reaction.type)}
                                                  className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] bg-[rgba(30,41,59,0.6)] text-[var(--text-secondary)] hover:bg-[rgba(250,204,21,0.1)] hover:text-[var(--gold-400)] transition-colors"
                                                >
                                                  {getReactionIcon(reaction.type)}
                                                  {reaction.count}
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleReaction(msg.id, "heart")} className="p-1 rounded text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--navy-700)] transition-colors">
                                              <Heart size={14} />
                                            </button>
                                            <button onClick={() => handleReaction(msg.id, "thumbsup")} className="p-1 rounded text-[var(--text-muted)] hover:text-green-400 hover:bg-[var(--navy-700)] transition-colors">
                                              <ThumbsUp size={14} />
                                            </button>
                                            <button className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--navy-700)] transition-colors">
                                              <MoreHorizontal size={14} />
                                            </button>
                                          </div>
                                        </div>
                                      </motion.div>
                                    );
                                  })
                                )}
                                {typingUsers.size > 0 && (
                                  <div className="flex items-center gap-2 px-2 py-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0" style={{ background: "rgba(59, 130, 246, 0.2)", color: "var(--blue-400)" }}>
                                      ?
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-[var(--text-muted)]">有人正在输入...</span>
                                      <div className="flex gap-0.5">
                                        <span className="w-1 h-1 rounded-full bg-[var(--gold-400)] animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                        <span className="w-1 h-1 rounded-full bg-[var(--gold-400)] animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                        <span className="w-1 h-1 rounded-full bg-[var(--gold-400)] animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <div ref={messagesEndRef} />
                              </div>

                              <div className="border-t border-[var(--navy-700)] p-3 mt-3">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => {
                                      setMessageInput(e.target.value);
                                      handleTyping();
                                    }}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                    placeholder="输入消息..."
                                    className="flex-1 rounded-lg border border-[var(--navy-700)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)] transition-colors"
                                  />
                                  <button
                                    onClick={handleSendMessage}
                                    disabled={!messageInput.trim()}
                                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ background: "var(--gold-400)", color: "var(--navy-900)" }}
                                  >
                                    <Send size={14} />
                                    发送
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === "threads" && (
                            <div className="flex flex-col h-full">
                              {selectedThread ? (
                                <>
                                  <div className="flex items-center gap-2 mb-4 p-3 rounded-lg" style={{ background: "rgba(30,41,59,0.4)" }}>
                                    <button
                                      onClick={() => setSelectedThread(null)}
                                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--gold-400)] transition-colors"
                                    >
                                      <ArrowRight size={16} style={{ transform: "rotate(180deg)" }} />
                                    </button>
                                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{selectedThread.title}</h3>
                                    <span className="text-xs text-[var(--text-muted)]">{selectedThread.messageCount} 条回复</span>
                                  </div>
                                  <div className="flex-1 overflow-y-auto space-y-3 p-2">
                                    {threadMessages.length === 0 ? (
                                      <div className="text-center py-8">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full mx-auto mb-3" style={{ background: "rgba(250, 204, 21, 0.1)" }}>
                                          <Sparkles size={24} className="text-[var(--gold-400)]" />
                                        </div>
                                        <p className="text-sm text-[var(--text-primary)]">暂无回复</p>
                                        <p className="text-xs text-[var(--text-muted)]">成为第一个回复的人</p>
                                      </div>
                                    ) : (
                                      threadMessages.map((msg, i) => (
                                        <motion.div
                                          key={msg.id}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: i * 0.05 }}
                                          className="flex gap-2"
                                        >
                                          <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0"
                                            style={{
                                              background: msg.user
                                                ? "rgba(59, 130, 246, 0.2)"
                                                : "linear-gradient(135deg, #FACC15, #EAB308)",
                                              color: msg.user ? "var(--blue-400)" : "var(--navy-900)",
                                            }}
                                          >
                                            {msg.user?.avatar || msg.user?.name?.charAt(0) || msg.agent?.avatar || "AI"}
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                              <span className="text-xs font-semibold text-[var(--text-primary)]">
                                                {msg.user?.name || msg.agent?.name || "系统"}
                                              </span>
                                              <span className="text-[10px] text-[var(--text-muted)]">{msg.createdAt}</span>
                                            </div>
                                            <p className="text-sm text-[var(--text-secondary)]">{msg.content}</p>
                                          </div>
                                        </motion.div>
                                      ))
                                    )}
                                  </div>
                                  <div className="border-t border-[var(--navy-700)] p-3 mt-3">
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="text"
                                        value={threadReplyInput}
                                        onChange={(e) => setThreadReplyInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSendThreadReply()}
                                        placeholder="回复话题..."
                                        className="flex-1 rounded-lg border border-[var(--navy-700)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)] transition-colors"
                                      />
                                      <button
                                        onClick={handleSendThreadReply}
                                        disabled={!threadReplyInput.trim()}
                                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ background: "var(--gold-400)", color: "var(--navy-900)" }}
                                      >
                                        <Send size={14} />
                                        回复
                                      </button>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="flex-1 overflow-y-auto space-y-3 p-2">
                                  {threads.length === 0 ? (
                                    <div className="text-center py-16">
                                      <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-4" style={{ background: "rgba(250, 204, 21, 0.1)" }}>
                                        <Sparkles size={32} className="text-[var(--gold-400)]" />
                                      </div>
                                      <p className="text-sm text-[var(--text-primary)] mb-2">暂无话题</p>
                                      <p className="text-xs text-[var(--text-muted)]">创建一个话题开始讨论</p>
                                    </div>
                                  ) : (
                                    threads.map((thread, i) => (
                                      <motion.div
                                        key={thread.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => setSelectedThread(thread)}
                                        className="p-3 rounded-xl border border-[var(--navy-700)] hover:border-[var(--gold-400)] cursor-pointer transition-all"
                                        style={{ background: "rgba(30,41,59,0.4)" }}
                                      >
                                        <div className="flex items-start justify-between">
                                          <h4 className="text-sm font-semibold text-[var(--text-primary)]">{thread.title}</h4>
                                          <ChevronRight size={16} className="text-[var(--text-muted)]" />
                                        </div>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                                          <span>{thread.messageCount} 条消息</span>
                                          <span>{thread.createdAt}</span>
                                        </div>
                                      </motion.div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {activeTab === "matters" && (
                            <div className="space-y-3 p-2">
                              <div className="flex items-center gap-2 mb-4">
                                {["all", "open", "in_progress", "completed", "closed"].map((filter) => (
                                  <button
                                    key={filter}
                                    onClick={() => {
                                      setActiveMatterFilter(filter);
                                      fetchMatters();
                                    }}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                      activeMatterFilter === filter
                                        ? "text-[var(--navy-900)]"
                                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                    }`}
                                    style={{ background: activeMatterFilter === filter ? "var(--gold-400)" : "rgba(30,41,59,0.6)" }}
                                  >
                                    {filter === "all" ? "全部" : getStatusText(filter)}
                                  </button>
                                ))}
                              </div>
                              {matters.length === 0 ? (
                                <div className="text-center py-16">
                                  <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-4" style={{ background: "rgba(250, 204, 21, 0.1)" }}>
                                    <Target size={32} className="text-[var(--gold-400)]" />
                                  </div>
                                  <p className="text-sm text-[var(--text-primary)] mb-2">暂无事项</p>
                                  <p className="text-xs text-[var(--text-muted)]">创建一个事项来追踪工作进展</p>
                                </div>
                              ) : (
                                matters.map((matter, i) => (
                                  <motion.div
                                    key={matter.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => {
                                      setSelectedMatter(matter);
                                      setMatterForm({
                                        title: matter.title,
                                        description: matter.description,
                                        deadline: matter.deadline || "",
                                        deliverables: "",
                                      });
                                      setShowMatterDetail(true);
                                    }}
                                    className="p-4 rounded-xl border border-[var(--navy-700)] hover:border-[var(--gold-400)] cursor-pointer transition-all"
                                    style={{ background: "rgba(30,41,59,0.4)" }}
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <h4 className="text-sm font-semibold text-[var(--text-primary)]">{matter.title}</h4>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(matter.status)}`}>
                                        {getStatusText(matter.status)}
                                      </span>
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3">{matter.description}</p>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                                        <span className="flex items-center gap-1">
                                          <div className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
                                            style={{ background: "rgba(59,130,246,0.2)", color: "var(--blue-400)" }}
                                          >
                                            {matter.owner.avatar || matter.owner.name.charAt(0)}
                                          </div>
                                          {matter.owner.name}
                                        </span>
                                        {matter.deadline && (
                                          <span className="flex items-center gap-1 text-[var(--gold-400)]">
                                            <Calendar size={10} />
                                            {matter.deadline}
                                          </span>
                                        )}
                                        {matter.assignee && (
                                          <span className="flex items-center gap-1">
                                            <User size={10} />
                                            {matter.assignee.name}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); handleMatterStatusChange(matter.id, "in_progress"); }} className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--gold-400)] hover:bg-[var(--navy-700)] transition-colors" title="开始处理">
                                          <Clock size={12} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleMatterStatusChange(matter.id, "completed"); }} className="p-1.5 rounded text-[var(--text-muted)] hover:text-green-400 hover:bg-[var(--navy-700)] transition-colors" title="标记完成">
                                          <CheckCircle size={12} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); }} className="p-1.5 rounded text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--navy-700)] transition-colors" title="删除">
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))
                              )}
                            </div>
                          )}

                          {activeTab === "analytics" && (
                            <div className="p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <BarChart3 size={18} className="text-[var(--gold-400)]" />
                                  <h3 className="text-sm font-bold text-[var(--text-primary)]">社区分析</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                  {["24h", "7d", "30d"].map((period) => (
                                    <button
                                      key={period}
                                      onClick={() => setAnalyticsPeriod(period)}
                                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                        analyticsPeriod === period
                                          ? "text-[var(--navy-900)]"
                                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                      }`}
                                      style={{ background: analyticsPeriod === period ? "var(--gold-400)" : "rgba(30,41,59,0.6)" }}
                                    >
                                      {period === "24h" ? "24小时" : period === "7d" ? "7天" : "30天"}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {analyticsData ? (
                                <>
                                  <div className="grid grid-cols-3 gap-3">
                                    <div className="p-4 rounded-xl border border-[var(--navy-700)]" style={{ background: "rgba(30,41,59,0.4)" }}>
                                      <div className="flex items-center gap-2 mb-2">
                                        <Users size={14} className="text-[var(--blue-400)]" />
                                        <span className="text-xs text-[var(--text-muted)]">社区成员</span>
                                      </div>
                                      <p className="text-xl font-bold text-[var(--text-primary)]">{analyticsData.memberCount}</p>
                                      <p className="text-xs text-[var(--text-muted)] mt-1">{analyticsData.activeMemberCount} 活跃成员</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-[var(--navy-700)]" style={{ background: "rgba(30,41,59,0.4)" }}>
                                      <div className="flex items-center gap-2 mb-2">
                                        <MessageCircle size={14} className="text-[var(--gold-400)]" />
                                        <span className="text-xs text-[var(--text-muted)]">消息数量</span>
                                      </div>
                                      <p className="text-xl font-bold text-[var(--text-primary)]">{analyticsData.totalMessages}</p>
                                      <p className="text-xs text-[var(--text-muted)] mt-1">期间发送</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-[var(--navy-700)]" style={{ background: "rgba(30,41,59,0.4)" }}>
                                      <div className="flex items-center gap-2 mb-2">
                                        <Target size={14} className="text-[var(--green-400)]" />
                                        <span className="text-xs text-[var(--text-muted)]">事项总数</span>
                                      </div>
                                      <p className="text-xl font-bold text-[var(--text-primary)]">{analyticsData.matterStats.total}</p>
                                      <p className="text-xs text-[var(--text-muted)] mt-1">{analyticsData.matterStats.byStatus.completed || 0} 已完成</p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border border-[var(--navy-700)]" style={{ background: "rgba(30,41,59,0.4)" }}>
                                      <div className="flex items-center gap-2 mb-3">
                                        <Activity size={14} className="text-[var(--gold-400)]" />
                                        <span className="text-xs font-semibold text-[var(--text-primary)]">活动趋势</span>
                                      </div>
                                      <div className="space-y-2">
                                        {analyticsData.activityData.slice(-7).map((item, i) => (
                                          <div key={i} className="flex items-center gap-2">
                                            <span className="text-[10px] text-[var(--text-muted)] w-12">{item.date.split('-').slice(1).join('/')}</span>
                                            <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: "rgba(15,23,42,0.6)" }}>
                                              <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                  width: `${Math.max(5, (item.count / (Math.max(...analyticsData.activityData.map(d => d.count), 1))) * 100)}%`,
                                                  background: "linear-gradient(90deg, var(--gold-400), var(--gold-600))",
                                                }}
                                              />
                                            </div>
                                            <span className="text-xs text-[var(--text-secondary)] w-8">{item.count}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="p-4 rounded-xl border border-[var(--navy-700)]" style={{ background: "rgba(30,41,59,0.4)" }}>
                                      <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp size={14} className="text-[var(--green-400)]" />
                                        <span className="text-xs font-semibold text-[var(--text-primary)]">热门频道</span>
                                      </div>
                                      <div className="space-y-3">
                                        {analyticsData.topChannels.map((channel, i) => (
                                          <div key={channel.id} className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold"
                                              style={{ background: "rgba(250,204,21,0.1)", color: "var(--gold-400)" }}
                                            >
                                              {i + 1}
                                            </div>
                                            <div className="flex-1">
                                              <p className="text-xs font-medium text-[var(--text-primary)]">{channel.name}</p>
                                              <p className="text-[10px] text-[var(--text-muted)]">{channel.messageCount} 条消息</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-4 rounded-xl border border-[var(--navy-700)]" style={{ background: "rgba(30,41,59,0.4)" }}>
                                    <div className="flex items-center gap-2 mb-3">
                                      <FileText size={14} className="text-[var(--purple-400)]" />
                                      <span className="text-xs font-semibold text-[var(--text-primary)]">事项状态分布</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                      {Object.entries(analyticsData.matterStats.byStatus).map(([status, count]) => (
                                        <div key={status} className="flex items-center gap-2">
                                          <div className="w-3 h-3 rounded-full" style={{
                                            backgroundColor: status === 'open' ? '#22c55e' :
                                              status === 'in_progress' ? '#eab308' :
                                              status === 'completed' ? '#3b82f6' : '#6b7280',
                                          }} />
                                          <span className="text-xs text-[var(--text-secondary)]">{getStatusText(status)}</span>
                                          <span className="text-xs font-bold text-[var(--text-primary)]">{count}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="text-center py-16">
                                  <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-4" style={{ background: "rgba(250, 204, 21, 0.1)" }}>
                                    <BarChart3 size={32} className="text-[var(--gold-400)]" />
                                  </div>
                                  <p className="text-sm text-[var(--text-primary)] mb-2">加载分析数据中...</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <div className="flex h-24 w-24 items-center justify-center rounded-full mx-auto mb-4" style={{ background: "rgba(250, 204, 21, 0.1)" }}>
                            <Hash size={48} className="text-[var(--gold-400)] opacity-50" />
                          </div>
                          <p className="text-sm text-[var(--text-primary)] mb-2">选择一个频道</p>
                          <p className="text-xs text-[var(--text-muted)]">从左侧选择一个频道开始聊天或查看事项</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full mx-auto mb-4" style={{ background: "rgba(250, 204, 21, 0.1)" }}>
                    <Globe size={48} className="text-[var(--gold-400)] opacity-50" />
                  </div>
                  <p className="text-sm text-[var(--text-primary)] mb-2">选择或创建一个社区</p>
                  <p className="text-xs text-[var(--text-muted)]">从左侧列表选择一个社区，或创建新社区开始协作</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {showCreateCommunity && (
          <CreateCommunityModal
            form={communityForm}
            setForm={setCommunityForm}
            onSubmit={handleCreateCommunity}
            onClose={() => setShowCreateCommunity(false)}
          />
        )}

        {showCreateChannel && (
          <CreateChannelModal
            form={channelForm}
            setForm={setChannelForm}
            onSubmit={handleCreateChannel}
            onClose={() => setShowCreateChannel(false)}
          />
        )}

        {showCreateMatter && (
          <CreateMatterModal
            form={matterForm}
            setForm={setMatterForm}
            onSubmit={handleCreateMatter}
            onClose={() => setShowCreateMatter(false)}
          />
        )}

        {showCreateThread && (
          <CreateThreadModal
            form={threadForm}
            setForm={setThreadForm}
            onSubmit={handleCreateThread}
            onClose={() => setShowCreateThread(false)}
          />
        )}

        {showMatterDetail && selectedMatter && (
          <MatterDetailModal
            matter={selectedMatter}
            form={matterForm}
            setForm={setMatterForm}
            onUpdate={handleUpdateMatter}
            onClose={() => {
              setShowMatterDetail(false);
              setSelectedMatter(null);
            }}
            onStatusChange={(status) => handleMatterStatusChange(selectedMatter.id, status)}
          />
        )}
      </div>
    </Layout>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}

function Tabs({ value, onValueChange, children }) {
  return <div className="flex">{children}</div>;
}

function TabsList({ children, className, style }) {
  return <div className={`flex p-1 rounded-lg ${className}`} style={style}>{children}</div>;
}

function TabsTrigger({ value, className, style, children, onClick }) {
  return <button onClick={onClick} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${className}`} style={style}>{children}</button>;
}

function CreateCommunityModal({ form, setForm, onSubmit, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl border border-[var(--navy-700)]"
        style={{ background: "var(--gradient-navy-card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--navy-700)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">创建社区</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">社区名称</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="输入社区名称"
              className="w-full rounded-lg border border-[var(--navy-700)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">社区描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="描述社区的目的和功能"
              rows={3}
              className="w-full rounded-lg border border-[var(--navy-700)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)] resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">访问权限</label>
            <div className="flex gap-2">
              {["public", "private"].map((type) => (
                <button
                  key={type}
                  onClick={() => setForm((prev) => ({ ...prev, accessType: type }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                    form.accessType === type
                      ? "text-[var(--navy-900)]"
                      : "border border-[var(--navy-700)] text-[var(--text-muted)] hover:border-[var(--gold-400)]"
                  }`}
                  style={{ background: form.accessType === type ? "var(--gold-400)" : "transparent" }}
                >
                  {type === "public" ? "公开" : "私有"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[var(--navy-700)] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] border border-[var(--navy-700)]">
            取消
          </button>
          <button
            onClick={onSubmit}
            disabled={!form.name}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ background: "var(--gold-400)", color: "var(--navy-900)" }}
          >
            创建社区
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CreateChannelModal({ form, setForm, onSubmit, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl border border-[var(--navy-700)]"
        style={{ background: "var(--gradient-navy-card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--navy-700)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">创建频道</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">频道名称</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="输入频道名称"
              className="w-full rounded-lg border border-[var(--navy-700)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">频道描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="描述频道的用途"
              rows={3}
              className="w-full rounded-lg border border-[var(--navy-700)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)] resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[var(--navy-700)] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] border border-[var(--navy-700)]">
            取消
          </button>
          <button
            onClick={onSubmit}
            disabled={!form.name}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ background: "var(--gold-400)", color: "var(--navy-900)" }}
          >
            创建频道
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CreateMatterModal({ form, setForm, onSubmit, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl border border-[var(--navy-700)]"
        style={{ background: "var(--gradient-navy-card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--navy-700)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">创建事项</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">事项标题</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="输入事项标题"
              className="w-full rounded-lg border border-[var(--navy-700)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">事项描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="描述事项详情"
              rows={3}
              className="w-full rounded-lg border border-[var(--navy-700)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)] resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">截止日期</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
                className="w-full rounded-lg border border-[var(--navy-700)] px-4 py-2.5 text-sm text-[var(--text-primary)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">交付物</label>
              <input
                type="text"
                value={form.deliverables}
                onChange={(e) => setForm((prev) => ({ ...prev, deliverables: e.target.value }))}
                placeholder="交付物描述"
                className="w-full rounded-lg border border-[var(--navy-700)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[var(--navy-700)] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] border border-[var(--navy-700)]">
            取消
          </button>
          <button
            onClick={onSubmit}
            disabled={!form.title}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ background: "var(--gold-400)", color: "var(--navy-900)" }}
          >
            创建事项
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CreateThreadModal({ form, setForm, onSubmit, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl border border-[var(--navy-700)]"
        style={{ background: "var(--gradient-navy-card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--navy-700)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">创建话题</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">话题标题</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="输入话题标题"
              className="w-full rounded-lg border border-[var(--navy-700)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">话题内容</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="描述话题内容"
              rows={4}
              className="w-full rounded-lg border border-[var(--navy-700)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)] resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[var(--navy-700)] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] border border-[var(--navy-700)]">
            取消
          </button>
          <button
            onClick={onSubmit}
            disabled={!form.title}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{ background: "var(--gold-400)", color: "var(--navy-900)" }}
          >
            创建话题
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MatterDetailModal({ matter, form, setForm, onUpdate, onClose, onStatusChange }) {
  const [assigneeInput, setAssigneeInput] = useState("");
  const [comments, setComments] = useState<string[]>([]);
  const [commentInput, setCommentInput] = useState("");

  const handleAssign = () => {
    if (assigneeInput.trim()) {
      alert(`已将事项分配给: ${assigneeInput}`);
      setAssigneeInput("");
    }
  };

  const handleAddComment = () => {
    if (commentInput.trim()) {
      setComments([...comments, commentInput.trim()]);
      setCommentInput("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl border border-[var(--navy-700)]"
        style={{ background: "var(--gradient-navy-card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--navy-700)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">事项详情</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">当前状态</span>
            <div className="flex items-center gap-2">
              {["open", "in_progress", "completed", "closed"].map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(status)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    matter.status === status
                      ? "text-[var(--navy-900)]"
                      : "border border-[var(--navy-700)] text-[var(--text-muted)] hover:border-[var(--gold-400)]"
                  }`}
                  style={{ background: matter.status === status ? "var(--gold-400)" : "transparent" }}
                >
                  {status === "open" ? "待处理" : status === "in_progress" ? "进行中" : status === "completed" ? "已完成" : "已关闭"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">事项标题</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-lg border border-[var(--navy-700)] px-4 py-2.5 text-sm text-[var(--text-primary)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">事项描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full rounded-lg border border-[var(--navy-700)] px-4 py-2.5 text-sm text-[var(--text-primary)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)] resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">截止日期</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
                className="w-full rounded-lg border border-[var(--navy-700)] px-4 py-2.5 text-sm text-[var(--text-primary)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">交付物</label>
              <input
                type="text"
                value={form.deliverables}
                onChange={(e) => setForm((prev) => ({ ...prev, deliverables: e.target.value }))}
                placeholder="交付物描述"
                className="w-full rounded-lg border border-[var(--navy-700)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">分配给</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={assigneeInput}
                onChange={(e) => setAssigneeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAssign()}
                placeholder="输入成员名称"
                className="flex-1 rounded-lg border border-[var(--navy-700)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
              />
              <button
                onClick={handleAssign}
                disabled={!assigneeInput.trim()}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--gold-400)", color: "var(--navy-900)" }}
              >
                分配
              </button>
            </div>
            {matter.assignee && (
              <div className="flex items-center gap-2 mt-2 text-xs text-[var(--text-secondary)]">
                <User size={12} />
                当前负责人: {matter.assignee.name}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <User size={14} className="text-[var(--text-muted)]" />
            <span className="text-xs text-[var(--text-secondary)]">创建人: {matter.owner.name}</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">评论</label>
            <div className="space-y-2 mb-3">
              {comments.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)]">暂无评论</p>
              ) : (
                comments.map((comment, i) => (
                  <div key={i} className="p-2 rounded-lg text-xs text-[var(--text-secondary)]" style={{ background: "rgba(30,41,59,0.4)" }}>
                    <span className="text-[var(--gold-400)] font-medium">我</span>: {comment}
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                placeholder="添加评论..."
                className="flex-1 rounded-lg border border-[var(--navy-700)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-[rgba(15,23,42,0.6)] outline-none focus:border-[var(--gold-400)]"
              />
              <button
                onClick={handleAddComment}
                disabled={!commentInput.trim()}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--gold-400)", color: "var(--navy-900)" }}
              >
                添加
              </button>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[var(--navy-700)] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] border border-[var(--navy-700)]">
            取消
          </button>
          <button
            onClick={onUpdate}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: "var(--gold-400)", color: "var(--navy-900)" }}
          >
            更新事项
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
