import { useState, useEffect } from 'react'
import { X, Eye, EyeOff, Mail, Phone, User, Building2, IdCard, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import { Alert, AlertDescription } from '../components/ui/alert'
import { useAuth } from '../contexts/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'login' | 'register'
  onSuccess?: () => void
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'login', onSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab)
  const [loginMethod, setLoginMethod] = useState<'password' | 'phone'>('password')
  const [userType, setUserType] = useState<'personal' | 'enterprise'>('personal')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const [loginForm, setLoginForm] = useState({ email: '', password: '', phone: '', code: '' })
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    code: '',
    companyName: '',
    companyId: '',
    idCard: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { login, loginWithPhone, register, sendCode } = useAuth()

  useEffect(() => {
    setActiveTab(defaultTab)
    setError('')
  }, [defaultTab, isOpen])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendCode = async () => {
    const phone = activeTab === 'login' ? loginForm.phone : registerForm.phone
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      await sendCode(phone)
      setCountdown(60)
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      if (loginMethod === 'password') {
        await login(loginForm.email, loginForm.password)
      } else {
        await loginWithPhone(loginForm.phone, loginForm.code)
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    if (registerForm.password.length < 6) {
      setError('密码长度至少为6位')
      return
    }
    if (!registerForm.phone || !/^1[3-9]\d{9}$/.test(registerForm.phone)) {
      setError('请输入正确的手机号')
      return
    }
    if (!registerForm.code) {
      setError('请输入验证码')
      return
    }
    if (userType === 'personal' && !registerForm.idCard) {
      setError('个人认证请填写身份证号')
      return
    }
    if (userType === 'enterprise' && (!registerForm.companyName || !registerForm.companyId)) {
      setError('企业认证请填写企业名称和统一社会信用代码')
      return
    }

    setIsLoading(true)
    try {
      await register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        phone: registerForm.phone,
        userType,
        companyName: userType === 'enterprise' ? registerForm.companyName : undefined,
        companyId: userType === 'enterprise' ? registerForm.companyId : undefined,
        idCard: userType === 'personal' ? registerForm.idCard : undefined,
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 pt-8 pb-6">
          <h2 className="text-2xl font-bold text-white text-center">
            {activeTab === 'login' ? '欢迎回来' : '加入 IPClaw'}
          </h2>
          <p className="text-indigo-100 text-center mt-2 text-sm">
            {activeTab === 'login' ? '登录您的账号，探索知识产权AI世界' : '创建账号，开启您的AI知识产权之旅'}
          </p>
        </div>

        <div className="p-6 auth-modal-light-theme">
          <style>{`
            .auth-modal-light-theme {
              --background: 0 0% 100%;
              --foreground: 222 47% 8%;
              --card: 0 0% 100%;
              --card-foreground: 222 47% 8%;
              --popover: 0 0% 100%;
              --popover-foreground: 222 47% 8%;
              --primary: 243 75% 59%;
              --primary-foreground: 0 0% 100%;
              --secondary: 210 40% 96%;
              --secondary-foreground: 222 47% 8%;
              --muted: 210 40% 96%;
              --muted-foreground: 215 16% 47%;
              --accent: 210 40% 96%;
              --accent-foreground: 222 47% 8%;
              --destructive: 0 84% 60%;
              --destructive-foreground: 0 0% 100%;
              --border: 214 32% 91%;
              --input: 214 32% 91%;
              --ring: 243 75% 59%;
              color: hsl(222 47% 8%);
            }
            .auth-modal-light-theme input {
              background-color: hsl(210 40% 96%);
              color: hsl(222 47% 8%);
            }
            .auth-modal-light-theme input::placeholder {
              color: hsl(215 16% 65%);
            }
            .auth-modal-light-theme input:focus {
              background-color: hsl(0 0% 100%);
            }
            .auth-modal-light-theme label {
              color: hsl(222 47% 15%);
            }
          `}</style>
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'login' | 'register'); setError('') }}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => { setLoginMethod('password'); setError('') }}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    loginMethod === 'password'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  邮箱密码登录
                </button>
                <button
                  onClick={() => { setLoginMethod('phone'); setError('') }}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    loginMethod === 'phone'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  手机验证码登录
                </button>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {loginMethod === 'password' ? (
                  <>
                    <div className="space-y-2">
                      <Label>邮箱</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="请输入邮箱地址"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>密码</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="请输入密码"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>手机号</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="tel"
                          placeholder="请输入手机号"
                          value={loginForm.phone}
                          onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>验证码</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type="text"
                            placeholder="6位验证码"
                            value={loginForm.code}
                            onChange={(e) => setLoginForm({ ...loginForm, code: e.target.value })}
                            maxLength={6}
                            required
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSendCode}
                          disabled={countdown > 0 || isLoading}
                          className="whitespace-nowrap"
                        >
                          {countdown > 0 ? `${countdown}s` : '获取验证码'}
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? '登录中...' : '登录'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                还没有账号？
                <button
                  onClick={() => { setActiveTab('register'); setError('') }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium ml-1"
                >
                  立即注册
                </button>
              </div>
            </TabsContent>

            <TabsContent value="register">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => { setUserType('personal'); setError('') }}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    userType === 'personal'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <User className="w-4 h-4" />
                  个人认证
                </button>
                <button
                  onClick={() => { setUserType('enterprise'); setError('') }}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    userType === 'enterprise'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  企业认证
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>用户名</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="用户名"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="邮箱地址"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>手机号</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder="请输入手机号"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendCode}
                      disabled={countdown > 0 || isLoading}
                      className="whitespace-nowrap"
                    >
                      {countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>验证码</Label>
                  <Input
                    type="text"
                    placeholder="请输入6位验证码"
                    value={registerForm.code}
                    onChange={(e) => setRegisterForm({ ...registerForm, code: e.target.value })}
                    maxLength={6}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>设置密码</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="至少6位"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>确认密码</Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="再次输入"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {userType === 'personal' ? (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <IdCard className="w-4 h-4" />
                      身份证号
                    </Label>
                    <Input
                      type="text"
                      placeholder="请输入身份证号（用于实名认证）"
                      value={registerForm.idCard}
                      onChange={(e) => setRegisterForm({ ...registerForm, idCard: e.target.value })}
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        企业名称
                      </Label>
                      <Input
                        type="text"
                        placeholder="请输入企业全称"
                        value={registerForm.companyName}
                        onChange={(e) => setRegisterForm({ ...registerForm, companyName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <IdCard className="w-4 h-4" />
                        统一社会信用代码
                      </Label>
                      <Input
                        type="text"
                        placeholder="请输入18位统一社会信用代码"
                        value={registerForm.companyId}
                        onChange={(e) => setRegisterForm({ ...registerForm, companyId: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <span>
                    您的认证信息仅用于身份验证，我们严格保护您的隐私安全。
                    {userType === 'enterprise' && '企业认证可享受更多企业级服务权限。'}
                  </span>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? '注册中...' : '注册并登录'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                已有账号？
                <button
                  onClick={() => { setActiveTab('login'); setError('') }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium ml-1"
                >
                  立即登录
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}