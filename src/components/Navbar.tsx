import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut, Settings, Sparkles, ChevronDown, Coins } from 'lucide-react'
import { Button } from '../components/ui/button'
import AuthModal from '../components/AuthModal'
import { useAuth } from '../contexts/AuthContext'

interface NavbarProps {
  hideLogo?: boolean
  showLoginButtonsOnly?: boolean
  hideUserMenu?: boolean
}

export default function Navbar({ hideLogo = false, showLoginButtonsOnly = false, hideUserMenu = false }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navigate = useNavigate()

  const openLogin = () => {
    setAuthTab('login')
    setShowAuthModal(true)
  }

  const openRegister = () => {
    setAuthTab('register')
    setShowAuthModal(true)
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    navigate('/')
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          {!hideLogo && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl text-white">IPClaw</span>
            </Link>
          )}
          {hideLogo && <div />}

          <div className="flex items-center gap-3">
            {showLoginButtonsOnly ? (
              <>
                <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={openLogin}>
                  登录
                </Button>
                <Button onClick={openRegister} className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900 font-semibold">
                  免费注册
                </Button>
              </>
            ) : isAuthenticated && user && !hideUserMenu ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user.avatar || user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-white text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-yellow-400" />
                      {user.balance || 0} 积分
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {user.avatar || user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { navigate('/profile'); setShowUserMenu(false) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">个人中心</span>
                      </button>
                      <button
                        onClick={() => { navigate('/profile'); setShowUserMenu(false) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">账号设置</span>
                      </button>
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-red-50 transition-colors text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">退出登录</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : !isAuthenticated ? (
              <>
                <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={openLogin}>
                  登录
                </Button>
                <Button onClick={openRegister} className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900 font-semibold">
                  免费注册
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authTab}
        onSuccess={() => setShowAuthModal(false)}
      />
    </>
  )
}