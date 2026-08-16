import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { apiErrorMessage } from '../api/apiClient';
import { useI18n } from '../useI18n';

export default function Login() {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();
  const submit = async ({ username, password }) => {
    setSubmitting(true); setError('');
    try {
      const { data } = await apiClient.post('/assessment/v1/auth/login', { username, password });
      sessionStorage.setItem('assessment_access_token', data.token);
      sessionStorage.setItem('assessment_user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('assessment-user-changed'));
      message.success(t('loginSuccess', { name: data.user?.display_name || data.user?.username || username }));
      navigate('/');
    } catch (err) { setError(err.response?.data?.code === 'invalid_credentials' ? t('invalidCredentials') : apiErrorMessage(err, t)); } finally { setSubmitting(false); }
  };

  return <section className="login-page"><Card className="login-card" bordered={false}><div className="login-mark"><LockOutlined /></div><Typography.Title level={2}>{t('welcomeBack')}</Typography.Title><Typography.Paragraph type="secondary">{t('loginHint')}</Typography.Paragraph>{error && <Alert className="form-alert" type="error" showIcon message={error} />}<Form layout="vertical" requiredMark={false} onFinish={submit} size="large"><Form.Item name="username" rules={[{ required: true, message: t('username') }]}><Input prefix={<UserOutlined />} autoComplete="username" placeholder={t('username')} aria-label={t('username')} /></Form.Item><Form.Item name="password" rules={[{ required: true, message: t('password') }]}><Input.Password prefix={<LockOutlined />} autoComplete="current-password" placeholder={t('password')} aria-label={t('password')} /></Form.Item><Button type="primary" htmlType="submit" loading={submitting} block>{t('login')}</Button></Form></Card></section>;
}
