import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import 'antd/dist/reset.css';
import App from './App';
import './index.scss';
import { I18nProvider } from './i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider locale={viVN} theme={{ token: { colorPrimary: '#3156d3', borderRadius: 12, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' } }}>
      <I18nProvider><BrowserRouter><App /></BrowserRouter></I18nProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
