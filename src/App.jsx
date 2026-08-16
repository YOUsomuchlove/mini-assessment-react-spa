import { BookOutlined, DownOutlined, LoginOutlined, LogoutOutlined, UpOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import apiClient, { clearSession, getAccessTokenExpiry, refreshAccessToken } from './api/apiClient';
import { useI18n } from './useI18n';
import Login from './pages/Login';
import AssessmentList from './pages/AssessmentList';
import AssessmentDetail from './pages/AssessmentDetail';
import vietnamFlag from './assets/flag-vn.svg';
import unitedKingdomFlag from './assets/flag-gb.svg';
const { Header, Content, Footer } = Layout;
const getUser = () => { try { return JSON.parse(sessionStorage.getItem('assessment_user')) || null; } catch { return null; } };
const initials = (name) => name?.trim().charAt(0).toUpperCase() || 'U';
export default function App() {
  const navigate = useNavigate(); const location = useLocation(); const { language, setLanguage, t } = useI18n(); const [user, setUser] = useState(getUser); const [accountOpen, setAccountOpen] = useState(false);
  const locale = location.pathname.split('/')[1] === 'en' ? 'en' : 'vi';
  useEffect(() => { if (language !== locale) setLanguage(locale); }, [language, locale, setLanguage]);
  useEffect(() => {
    let active = true;
    let refreshTimer;
    const scheduleRefresh = (token) => {
      window.clearTimeout(refreshTimer);
      const expiresAt = getAccessTokenExpiry(token);
      const delay = Math.max(15_000, expiresAt - Date.now() - 60_000);
      refreshTimer = window.setTimeout(async () => {
        try { const nextToken = await refreshAccessToken(); if (active) scheduleRefresh(nextToken); }
        catch { if (active) { clearSession(); setUser(null); } }
      }, delay);
    };
    const hydrateSession = async () => {
      try {
        let token = sessionStorage.getItem('assessment_access_token');
        if (!token || getAccessTokenExpiry(token) <= Date.now() + 60_000) token = await refreshAccessToken();
        const { data } = await apiClient.get('/assessment/v1/auth/me');
        if (!active) return;
        sessionStorage.setItem('assessment_user', JSON.stringify(data));
        setUser(data);
        scheduleRefresh(token);
      } catch {
        if (active) { clearSession(); setUser(null); }
      }
    };
    hydrateSession();
    window.addEventListener('assessment-user-changed', hydrateSession);
    return () => { active = false; window.clearTimeout(refreshTimer); window.removeEventListener('assessment-user-changed', hydrateSession); };
  }, []);
  const changeLanguage = (next) => { const suffix = location.pathname.replace(/^\/(vi|en)/, '') || ''; setLanguage(next); navigate(`/${next}${suffix}`); };
  const logout = async () => { setAccountOpen(false); try { await apiClient.post('/assessment/v1/auth/logout'); } catch { /* Clear local data even if the refresh cookie has already expired. */ } clearSession(); setUser(null); navigate(`/${locale}`); };
  const languageFlag = locale === 'vi' ? vietnamFlag : unitedKingdomFlag;
  const languageMenu = [{ key: 'vi', label: <span className="language-option"><img src={vietnamFlag} alt="" />VN</span>, onClick: () => changeLanguage('vi') }, { key: 'en', label: <span className="language-option"><img src={unitedKingdomFlag} alt="" />EN</span>, onClick: () => changeLanguage('en') }];
  const localeRoutes = (prefix) => <><Route path={`/${prefix}`} element={<AssessmentList />} /><Route path={`/${prefix}/login`} element={<Login />} /><Route path={`/${prefix}/assessment/:id`} element={<AssessmentDetail />} /></>;
  return <Layout className="app-shell"><Header className="topbar"><div className="topbar-inner"><button className="brand" onClick={() => navigate(`/${locale}`)}><BookOutlined /><span>Mini Assessment</span></button>{user ? <div className="header-controls"><Dropdown menu={{ items: languageMenu }} trigger={['click']} placement="bottomRight"><Button type="text" className="language-switcher" aria-label={t('language')}><img src={languageFlag} alt="" />{locale === 'vi' ? 'VN' : 'EN'} <DownOutlined /></Button></Dropdown><Dropdown open={accountOpen} onOpenChange={setAccountOpen} trigger={['click']} placement="bottomRight" classNames={{ root: 'account-dropdown-popup' }} popupRender={() => <div className="account-popup"><div className="account-popup-info"><Avatar size={48} className="user-avatar">{initials(user.display_name)}</Avatar><div><strong>{user.display_name || user.username}</strong><span>{user.username}</span><Tag>{user.roles?.join(', ') || 'User'}</Tag></div></div><div className="account-popup-footer"><Button type="primary" danger icon={<LogoutOutlined />} block onClick={logout}>{t('logout')}</Button></div></div>}><button type="button" className="account-dropdown-trigger" aria-expanded={accountOpen} aria-label={user.display_name || user.username}><Avatar size={36} className="user-avatar">{initials(user.display_name)}</Avatar><span className="user-identity"><strong>{user.display_name || user.username}</strong><small>{user.roles?.join(', ')}</small></span><span className="account-caret">{accountOpen ? <UpOutlined /> : <DownOutlined />}</span></button></Dropdown></div> : <div><Dropdown menu={{ items: languageMenu }} trigger={['click']}><Button type="text" className="language-switcher" aria-label={t('language')}><img src={languageFlag} alt="" />{locale === 'vi' ? 'VN' : 'EN'} <DownOutlined /></Button></Dropdown><Button type="text" className="header-action" icon={<LoginOutlined />} onClick={() => navigate(`/${locale}/login`)}>{t('login')}</Button></div>}</div></Header><Content className="app-content"><Routes>{localeRoutes('vi')}{localeRoutes('en')}<Route path="/" element={<Navigate to="/vi" replace />} /><Route path="*" element={<Navigate to={`/${locale}`} replace />} /></Routes></Content><Footer className="app-footer"><Typography.Text type="secondary">Mini Assessment · WordPress Headless + React</Typography.Text></Footer></Layout>;
}
