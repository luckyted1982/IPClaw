import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import {
  User,
  Settings,
  Shield,
  Coins,
  CreditCard,
  Bell,
  Moon,
  Globe,
  Lock,
  Mail,
  Phone,
  Building2,
  ChevronRight,
  Sparkles,
  Gift,
  TrendingUp,
  Clock,
  Zap,
  Crown,
  CheckCircle2,
  Users,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

export default function Profile() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  if (!user) return null

  const menuItems = [
    { id: 'overview', icon: User, label: '总览' },
    { id: 'profile', icon: Settings, label: '个人信息' },
    { id: 'security', icon: Shield, label: '账号安全' },
    { id: 'points', icon: Coins, label: '我的积分' },
    { id: 'subscription', icon: CreditCard, label: '订阅计划' },
    { id: 'notifications', icon: Bell, label: '消息通知' },
    { id: 'preferences', icon: Globe, label: '偏好设置' },
  ]

  return (
    <div className="min-h-screen profile-dark" style={{ backgroundColor: 'var(--navy-900)' }}>
      <style>{`
        .profile-dark { color: var(--text-primary); }
        .profile-dark .bg-gray-50 { background-color: var(--navy-800) !important; }
        .profile-dark .bg-gray-100 { background-color: var(--navy-700) !important; }
        .profile-dark .text-gray-900 { color: var(--text-primary) !important; }
        .profile-dark .text-gray-500 { color: var(--text-secondary) !important; }
        .profile-dark .text-gray-400 { color: var(--text-muted) !important; }
        .profile-dark .text-gray-600 { color: var(--text-secondary) !important; }
        .profile-dark .text-gray-700 { color: var(--text-secondary) !important; }
        .profile-dark .border-gray-100 { border-color: var(--navy-700) !important; }
        .profile-dark .border-gray-200 { border-color: var(--navy-700) !important; }
        .profile-dark .bg-indigo-50 { background-color: var(--navy-800) !important; }
        .profile-dark .bg-indigo-100 { background-color: var(--navy-700) !important; }
        .profile-dark .text-indigo-700 { color: var(--info) !important; }
        .profile-dark .text-indigo-600 { color: var(--info) !important; }
        .profile-dark .bg-green-50 { background-color: var(--navy-800) !important; }
        .profile-dark .bg-green-100 { background-color: var(--navy-700) !important; }
        .profile-dark .text-green-700 { color: var(--success) !important; }
        .profile-dark .text-green-600 { color: var(--success) !important; }
        .profile-dark .bg-yellow-100 { background-color: var(--navy-700) !important; }
        .profile-dark .text-yellow-700 { color: var(--warning) !important; }
        .profile-dark .text-yellow-600 { color: var(--warning) !important; }
        .profile-dark .bg-purple-100 { background-color: var(--navy-700) !important; }
        .profile-dark .text-purple-600 { color: #a78bfa !important; }
        .profile-dark .bg-blue-100 { background-color: var(--navy-700) !important; }
        .profile-dark .text-blue-600 { color: var(--info) !important; }
        .profile-dark .bg-red-100 { background-color: var(--navy-700) !important; }
        .profile-dark .text-red-600 { color: var(--error) !important; }
        .profile-dark .bg-white { background-color: var(--navy-800) !important; }
        .profile-dark .bg-gray-200 { background-color: var(--navy-700) !important; }
        .profile-dark input, .profile-dark select, .profile-dark textarea {
          background-color: var(--navy-800) !important;
          color: var(--text-primary) !important;
          border-color: var(--navy-700) !important;
        }
        .profile-dark input::placeholder { color: var(--text-muted) !important; }
        .profile-dark input:disabled { background-color: var(--navy-900) !important; color: var(--text-muted) !important; }
        .profile-dark [class*="from-indigo-50"] { background: var(--navy-800) !important; }
        .profile-dark .font-h4 { color: var(--text-secondary); }
        .profile-dark .font-small { color: var(--text-secondary); }
        .profile-dark .font-tiny { color: var(--text-muted); }
      `}</style>
      <div className="pb-32" style={{ backgroundColor: 'var(--navy-900)' }}>
        <Navbar hideLogo={true} />
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-24">
        <div className="flex flex-col lg:flex-row gap-6" style={{ paddingTop: '80px' }}>
          {/* Sidebar - Fixed */}
          <div className="lg:w-64 shrink-0 lg:sticky lg:top-20 lg:h-fit">
            <Card className="border-[var(--navy-700)]">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-[var(--navy-700)]">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-2xl font-bold mb-3">
                    {user.avatar || user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-white text-lg">{user.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="secondary" className="bg-[var(--navy-700)] text-[var(--info)] border-0">
                      {user.role === 'admin' ? '管理员' : user.userType === 'enterprise' ? '企业用户' : '个人用户'}
                    </Badge>
                    {user.verified && (
                      <Badge className="bg-[var(--navy-700)] text-[var(--success)] border-0">
                        已认证
                      </Badge>
                    )}
                  </div>
                </div>
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          activeTab === item.id
                            ? 'bg-[var(--navy-700)] text-[var(--gold-400)] font-medium'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--navy-700)]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'points' && <PointsTab />}
            {activeTab === 'subscription' && <SubscriptionTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'preferences' && <PreferencesTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

function OverviewTab() {
  const { user, token, updateUser } = useAuth()
  const [checkInStats, setCheckInStats] = useState<any>(null)
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)

  const fetchCheckInStats = async () => {
    if (!token) return
    try {
      const response = await fetch('/api/points/checkin-stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setCheckInStats(data)
        setHasCheckedInToday(data.hasCheckedInToday || false)
      }
    } catch (error) {
      console.error('Failed to fetch check-in stats:', error)
    }
  }

  const handleCheckIn = async () => {
    if (!token || hasCheckedInToday) return
    setIsCheckingIn(true)
    try {
      const response = await fetch('/api/points/checkin', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setHasCheckedInToday(true)
        if (data.newBalance !== undefined && updateUser) {
          updateUser({ balance: data.newBalance })
        }
        await fetchCheckInStats()
        alert(`签到成功！获得 ${data.totalPoints} 积分`)
      }
    } catch (error) {
      console.error('Check-in error:', error)
    } finally {
      setIsCheckingIn(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchCheckInStats()
    }
  }, [token])

  const stats = [
    { label: '可用积分', value: user?.balance || 0, icon: Coins, color: 'from-yellow-400 to-amber-500' },
    { label: '连续签到', value: `${checkInStats?.streak || 0}天`, icon: Gift, color: 'from-blue-400 to-indigo-500' },
    { label: '我的Agent', value: '3', icon: Sparkles, color: 'from-purple-400 to-pink-500' },
    { label: '累计签到', value: `${checkInStats?.totalCheckIns || 0}天`, icon: Clock, color: 'from-green-400 to-emerald-500' },
  ]

  const streakDays = checkInStats?.streak || 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>数据总览</CardTitle>
          <CardDescription>您的账号使用情况一目了然</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="p-4 rounded-xl bg-gray-50">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>订阅计划</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {user?.subscription === 'pro' ? 'Pro 专业版' : user?.subscription === 'enterprise' ? 'Enterprise 企业版' : 'Free 免费版'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.subscription === 'free' ? '升级解锁更多功能' : `有效期至 ${user?.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).toLocaleDateString() : '永久'}`}
                  </p>
                </div>
              </div>
              <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                {user?.subscription === 'free' ? '升级' : '管理'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>每日签到</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">连续签到 7 天可获得额外 50 积分奖励</p>
              <Badge className={`${hasCheckedInToday ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                已连续 {streakDays} 天
              </Badge>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div key={day} className="flex-1 text-center">
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-1 ${
                      day <= streakDays % 7 || (streakDays >= 7 && day <= 7)
                        ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {day <= streakDays % 7 || (streakDays >= 7 && day <= 7) ? <CheckCircle2 className="w-5 h-5" /> : day}
                  </div>
                  <p className="text-xs text-gray-500">第{day}天</p>
                </div>
              ))}
            </div>
            <Button
              className="w-full mt-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-semibold hover:from-yellow-500 hover:to-amber-600"
              disabled={hasCheckedInToday || isCheckingIn}
              onClick={handleCheckIn}
            >
              <Gift className="w-4 h-4 mr-2" />
              {isCheckingIn ? '签到中...' : hasCheckedInToday ? '今日已签到' : '今日签到 +10 积分'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>最近动态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-600">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">欢迎注册奖励</p>
                  <p className="text-xs text-gray-500">获得 100 积分</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">今天</p>
            </div>
            <div className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-100 text-purple-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">开始使用 AI 工作室</p>
                  <p className="text-xs text-gray-500">欢迎加入 IPClaw</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">今天</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileTab() {
  const { user, updateUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')

  return (
    <Card>
      <CardHeader>
        <CardTitle>个人信息</CardTitle>
        <CardDescription>管理您的基本信息和头像</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.avatar || user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">更换头像</p>
            <p className="text-sm text-gray-500 mb-2">支持 JPG、PNG 格式，大小不超过 2MB</p>
            <Button size="sm" variant="outline">上传头像</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>用户名</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              邮箱
            </Label>
            <Input value={user?.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              手机号
            </Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" />
              账号类型
            </Label>
            <div className="h-10 px-3 rounded-lg border border-[var(--navy-700)] flex items-center text-[var(--text-secondary)] text-sm bg-[var(--navy-800)]">
              {user?.userType === 'enterprise' ? '企业用户' : '个人用户'}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline">取消</Button>
          <Button onClick={() => updateUser({ name, phone })} className="bg-gradient-to-r from-indigo-600 to-purple-600">
            保存修改
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SecurityTab() {
  const securityItems = [
    {
      icon: Lock,
      title: '登录密码',
      desc: '定期更换密码可提高账号安全性',
      action: '修改',
      color: 'text-indigo-600 bg-indigo-100',
    },
    {
      icon: Phone,
      title: '手机绑定',
      desc: '已绑定 138****8888',
      action: '更换',
      color: 'text-green-600 bg-green-100',
    },
    {
      icon: Mail,
      title: '邮箱验证',
      desc: '已验证 test@example.com',
      action: '更换',
      color: 'text-blue-600 bg-blue-100',
    },
    {
      icon: Shield,
      title: '实名认证',
      desc: '已完成实名认证',
      action: '查看',
      color: 'text-purple-600 bg-purple-100',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>账号安全</CardTitle>
        <CardDescription>保护您的账号和隐私安全</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-[var(--navy-700)]">
        {securityItems.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.title} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-[var(--info)] hover:text-[var(--gold-400)] hover:bg-[var(--navy-700)]">
                {item.action} <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function PointsTab() {
  const { user, token, updateUser } = useAuth()
  const [checkInStats, setCheckInStats] = useState<any>(null)
  const [pointsHistory, setPointsHistory] = useState<any[]>([])
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState('rules')

  const fetchCheckInStats = async () => {
    if (!token) return
    try {
      const response = await fetch('/api/points/checkin-stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setCheckInStats(data)
        setHasCheckedInToday(data.hasCheckedInToday || false)
      }
    } catch (error) {
      console.error('Failed to fetch check-in stats:', error)
    }
  }

  const fetchPointsHistory = async () => {
    if (!token) return
    try {
      const response = await fetch('/api/points/history', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setPointsHistory(Array.isArray(data) ? data : data.transactions || [])
      }
    } catch (error) {
      console.error('Failed to fetch points history:', error)
    }
  }

  const handleCheckIn = async () => {
    if (!token || hasCheckedInToday) return
    setIsCheckingIn(true)
    try {
      const response = await fetch('/api/points/checkin', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setHasCheckedInToday(true)
        if (data.newBalance !== undefined && updateUser) {
          updateUser({ balance: data.newBalance })
        }
        await fetchCheckInStats()
        await fetchPointsHistory()
        alert(`签到成功！获得 ${data.totalPoints} 积分`)
      } else {
        const data = await response.json()
        alert(data.error || '签到失败')
      }
    } catch (error) {
      console.error('Check-in error:', error)
      alert('签到失败，请重试')
    } finally {
      setIsCheckingIn(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchCheckInStats()
      fetchPointsHistory()
    }
  }, [token])

  const earnRules = [
    { title: '每日签到', desc: '每天签到获得积分', points: '10/天', icon: Gift },
    { title: '创建Agent', desc: '创建并发布智能体', points: '20-100', icon: Sparkles },
    { title: '创建技能', desc: '创建并发布技能', points: '50-200', icon: Zap },
    { title: '回答问题', desc: '解答其他用户问题', points: '5-50', icon: TrendingUp },
    { title: '邀请好友', desc: '邀请好友注册认证', points: '100/人', icon: Users },
    { title: '订阅奖励', desc: '订阅套餐赠送积分', points: '500-5000', icon: Crown },
  ]

  const consumeRules = [
    { title: 'AI对话', desc: '基础模型对话', points: '1/次', icon: Zap },
    { title: 'Agent调用', desc: '使用智能体服务', points: '10-100', icon: Sparkles },
    { title: '技能调用', desc: '使用付费技能', points: '按技能定价', icon: Settings },
    { title: '专家咨询', desc: '预约专家服务', points: '按专家定价', icon: User },
    { title: '高级模型', desc: '使用GPT-4等高级模型', points: '5-20/次', icon: Crown },
    { title: '文件处理', desc: '文档处理和分析', points: '2-10/次', icon: Building2 },
  ]

  const streakDays = checkInStats?.streak || 0
  const totalCheckIns = checkInStats?.totalCheckIns || 0

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm mb-1">我的积分</p>
                <p className="text-4xl font-bold">{user?.balance || 0}</p>
                <p className="text-yellow-100 text-sm mt-1">当前可用积分</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-white/20 text-white border-0">
                    {user?.subscription === 'pro' ? 'Pro会员' : user?.subscription === 'enterprise' ? '企业版' : '免费用户'}
                  </Badge>
                </div>
                <Button variant="outline" className="bg-white/20 border-0 text-white hover:bg-white/30">
                  充值积分
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>每日签到</CardTitle>
          <CardDescription>连续签到可获得额外奖励</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">
                已连续签到<span className="font-semibold text-amber-600">{streakDays}</span> 天
              </p>
              <p className="text-xs text-gray-400 mt-1">累计签到 {totalCheckIns} 天</p>
            </div>
            <Badge className={`${hasCheckedInToday ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {hasCheckedInToday ? '今日已签到' : '今日未签到'}
            </Badge>
          </div>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div key={day} className="flex-1 text-center">
                <div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-1 ${
                    day <= streakDays % 7 || (streakDays >= 7 && day <= 7)
                      ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {day <= streakDays % 7 || (streakDays >= 7 && day <= 7) ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    day
                  )}
                </div>
                <p className="text-xs text-gray-500">第{day}天</p>
                {day === 7 && <p className="text-xs text-amber-500 font-medium">+50</p>}
              </div>
            ))}
          </div>
          <Button
            className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-semibold hover:from-yellow-500 hover:to-amber-600"
            disabled={hasCheckedInToday || isCheckingIn}
            onClick={handleCheckIn}
          >
            <Gift className="w-4 h-4 mr-2" />
            {isCheckingIn ? '签到中...' : hasCheckedInToday ? '今日已签到' : '立即签到 +10 积分'}
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          variant={activeSubTab === 'rules' ? 'default' : 'outline'}
          onClick={() => setActiveSubTab('rules')}
          size="sm"
        >
          积分规则
        </Button>
        <Button
          variant={activeSubTab === 'history' ? 'default' : 'outline'}
          onClick={() => setActiveSubTab('history')}
          size="sm"
        >
          积分记录
        </Button>
      </div>

      {activeSubTab === 'rules' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>如何赚取积分</CardTitle>
              <CardDescription>通过各种方式获取积分奖励</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {earnRules.map((rule) => {
                  const Icon = rule.icon
                  return (
                    <div key={rule.title} className="flex items-center gap-3 p-3 rounded-xl bg-green-50">
                      <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{rule.title}</p>
                        <p className="text-xs text-gray-500">{rule.desc}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600 text-sm">+{rule.points}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>积分消耗场景</CardTitle>
              <CardDescription>了解积分的使用方式</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {consumeRules.map((rule) => {
                  const Icon = rule.icon
                  return (
                    <div key={rule.title} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{rule.title}</p>
                        <p className="text-xs text-gray-500">{rule.desc}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-600 text-sm">-{rule.points}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeSubTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>积分记录</CardTitle>
            <CardDescription>您的积分变动明细</CardDescription>
          </CardHeader>
          <CardContent>
            {pointsHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Coins className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>暂无积分记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pointsHistory.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {item.type === 'earn' ? <Gift className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.description}</p>
                        <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString('zh-CN')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold text-sm ${
                          item.type === 'earn' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {item.type === 'earn' ? '+' : '-'}{item.amount}
                      </p>
                      <p className="text-xs text-gray-400">余额: {item.balanceAfter}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SubscriptionTab() {
  const { user, token } = useAuth()
  const [plans, setPlans] = useState<any[]>([])
  const [mySubscription, setMySubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscriptions/plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data)
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    }
  }

  const fetchMySubscription = async () => {
    if (!token) return
    try {
      const response = await fetch('/api/subscriptions/my', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setMySubscription(data)
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    }
  }

  const handleSubscribe = async (planName: string) => {
    if (!token) return
    if (planName === 'free') return
    setIsLoading(true)
    try {
      const response = await fetch('/api/subscriptions/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planName, billingCycle }),
      })
      if (response.ok) {
        const data = await response.json()
        alert('订阅成功！')
        await fetchMySubscription()
      } else {
        const data = await response.json()
        alert(data.error || '订阅失败')
      }
    } catch (error) {
      console.error('Subscribe error:', error)
      alert('订阅失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
    if (token) {
      fetchMySubscription()
    }
  }, [token])

  const currentPlan = user?.subscription || 'free'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>订阅计划</CardTitle>
          <CardDescription>选择适合您的方案，解锁更多功能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                按月付费
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                按年付费 <span className="text-xs text-green-500 ml-1">省20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly
              const isCurrentPlan = currentPlan === plan.name
              const isPopular = plan.name === 'pro'

              return (
                <div
                  key={plan.id}
                  className={`relative p-6 rounded-2xl border-2 transition-all ${
                    isPopular
                      ? 'border-indigo-500 bg-gradient-to-b from-indigo-50 to-white'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                        最受欢迎
                      </Badge>
                    </div>
                  )}
                  <h3 className="font-bold text-xl text-gray-900 mb-1">{plan.displayName}</h3>
                  <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">¥{price}</span>
                    <span className="text-gray-500">/{billingCycle === 'monthly' ? '月' : '年'}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features?.map((feature: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-500 cursor-default'
                        : isPopular
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                        : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
                    }`}
                    disabled={isCurrentPlan || isLoading || plan.name === 'free'}
                    onClick={() => handleSubscribe(plan.name)}
                  >
                    {isCurrentPlan ? '当前方案' : plan.name === 'enterprise' ? '联系销售' : '立即订阅'}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function NotificationsTab() {
  const [emailNotify, setEmailNotify] = useState(true)
  const [smsNotify, setSmsNotify] = useState(false)
  const [pushNotify, setPushNotify] = useState(true)

  const notificationTypes = [
    { id: 'system', title: '系统通知', desc: '账号安全、系统更新等通知', enabled: true },
    { id: 'agent', title: 'Agent动态', desc: '您的智能体运行状态更新', enabled: true },
    { id: 'task', title: '任务提醒', desc: '任务完成、待处理事项提醒', enabled: true },
    { id: 'marketing', title: '营销活动', desc: '优惠活动、新产品推荐', enabled: false },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>通知方式</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: '邮件通知', desc: '通过邮箱接收重要通知', value: emailNotify, onChange: setEmailNotify, icon: Mail },
            { label: '短信通知', desc: '通过短信接收关键提醒', value: smsNotify, onChange: setSmsNotify, icon: Phone },
            { label: '站内推送', desc: '站内消息实时推送', value: pushNotify, onChange: setPushNotify, icon: Bell },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => item.onChange(!item.value)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    item.value ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      item.value ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>通知类型</CardTitle>
          <CardDescription>自定义您想接收的通知类型</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map((type) => (
            <div key={type.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">{type.title}</p>
                <p className="text-sm text-gray-500">{type.desc}</p>
              </div>
              <button
                className={`w-12 h-6 rounded-full transition-colors ${
                  type.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    type.enabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function PreferencesTab() {
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('zh-CN')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>外观设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">深色模式</p>
                <p className="text-sm text-gray-500">切换深色/浅色主题</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between py-3 border-t">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">语言设置</p>
                <p className="text-sm text-gray-500">选择界面显示语言</p>
              </div>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white"
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}