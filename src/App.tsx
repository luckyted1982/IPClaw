import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import GlobalTask from './pages/GlobalTask'
import ProtectedRoute from './components/ProtectedRoute'
import PatentBusiness from './pages/PatentBusiness'
import PatentSearch from './pages/PatentSearch'
import PatentLayout from './pages/PatentLayout'
import PatentDrafting from './pages/PatentDrafting'
import FTOInvestigation from './pages/FTOInvestigation'
import PatentNavigation from './pages/PatentNavigation'
import PatentFeeManagement from './pages/PatentFeeManagement'
import PatentRightsProtection from './pages/PatentRightsProtection'
import OfficeActionResponse from './pages/OfficeActionResponse'
import TrademarkBusiness from './pages/TrademarkBusiness'
import TrademarkSearch from './pages/TrademarkSearch'
import TrademarkRegistration from './pages/TrademarkRegistration'
import TrademarkMonitoring from './pages/TrademarkMonitoring'
import TrademarkRightsProtection from './pages/TrademarkRightsProtection'
import CopyrightBusiness from './pages/CopyrightBusiness'
import CopyrightRegistration from './pages/CopyrightRegistration'
import CopyrightMonitoring from './pages/CopyrightMonitoring'
import CopyrightRightsProtection from './pages/CopyrightRightsProtection'
import CopyrightOperation from './pages/CopyrightOperation'
import DataIP from './pages/DataIP'
import DataIPRegistration from './pages/DataIPRegistration'
import DataIPRightsProtection from './pages/DataIPRightsProtection'
import DataIPCompliance from './pages/DataIPCompliance'
import DataIPTrading from './pages/DataIPTrading'
import TradeSecret from './pages/TradeSecret'
import TradeSecretIdentification from './pages/TradeSecretIdentification'
import TradeSecretProtection from './pages/TradeSecretProtection'
import TradeSecretInvestigation from './pages/TradeSecretInvestigation'
import TradeSecretLitigation from './pages/TradeSecretLitigation'
import AgentWorld from './pages/AgentWorld'
import ExpertPlatform from './pages/ExpertPlatform'
import FinanceInvestment from './pages/FinanceInvestment'
import IPValuation from './pages/IPValuation'
import IPSecuritization from './pages/IPSecuritization'
import IPPledge from './pages/IPPledge'
import IPEquity from './pages/IPEquity'
import IPInsurance from './pages/IPInsurance'
import IPDeal from './pages/IPDeal'
import SkillHub from './pages/SkillHub'
import KnowledgePlaza from './pages/KnowledgePlaza'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/global-task" element={<ProtectedRoute><GlobalTask /></ProtectedRoute>} />
      <Route path="/patent" element={<PatentBusiness />} />
      <Route path="/patent/search" element={<PatentSearch />} />
      <Route path="/patent/layout" element={<PatentLayout />} />
      <Route path="/patent/drafting" element={<PatentDrafting />} />
      <Route path="/patent/fto" element={<FTOInvestigation />} />
      <Route path="/patent/navigation" element={<PatentNavigation />} />
      <Route path="/patent/fee" element={<PatentFeeManagement />} />
      <Route path="/patent/rights" element={<PatentRightsProtection />} />
      <Route path="/patent/response" element={<OfficeActionResponse />} />
      <Route path="/trademark/search" element={<TrademarkSearch />} />
      <Route path="/trademark/registration" element={<TrademarkRegistration />} />
      <Route path="/trademark/monitoring" element={<TrademarkMonitoring />} />
      <Route path="/trademark/rights" element={<TrademarkRightsProtection />} />
      <Route path="/trademark" element={<TrademarkBusiness />} />
      <Route path="/copyright" element={<CopyrightBusiness />} />
      <Route path="/copyright/registration" element={<CopyrightRegistration />} />
      <Route path="/copyright/monitoring" element={<CopyrightMonitoring />} />
      <Route path="/copyright/rights" element={<CopyrightRightsProtection />} />
      <Route path="/copyright/operation" element={<CopyrightOperation />} />
      <Route path="/data-ip" element={<DataIP />} />
      <Route path="/data-ip/registration" element={<DataIPRegistration />} />
      <Route path="/data-ip/rights" element={<DataIPRightsProtection />} />
      <Route path="/data-ip/compliance" element={<DataIPCompliance />} />
      <Route path="/data-ip/trading" element={<DataIPTrading />} />
      <Route path="/trade-secret" element={<TradeSecret />} />
      <Route path="/trade-secret/identification" element={<TradeSecretIdentification />} />
      <Route path="/trade-secret/protection" element={<TradeSecretProtection />} />
      <Route path="/trade-secret/investigation" element={<TradeSecretInvestigation />} />
      <Route path="/trade-secret/litigation" element={<TradeSecretLitigation />} />
      <Route path="/agent-world" element={<AgentWorld />} />
      <Route path="/experts" element={<ExpertPlatform />} />
      <Route path="/finance" element={<FinanceInvestment />} />
      <Route path="/finance/valuation" element={<IPValuation />} />
      <Route path="/finance/securitization" element={<IPSecuritization />} />
      <Route path="/finance/pledge" element={<IPPledge />} />
      <Route path="/finance/equity" element={<IPEquity />} />
      <Route path="/finance/insurance" element={<IPInsurance />} />
      <Route path="/finance/deal" element={<IPDeal />} />
      <Route path="/skillhub" element={<SkillHub />} />
      <Route path="/knowledge" element={<KnowledgePlaza />} />
    </Routes>
  )
}
