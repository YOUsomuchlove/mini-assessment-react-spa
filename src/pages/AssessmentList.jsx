import { ArrowRightOutlined, DeleteOutlined, EditOutlined, FileAddOutlined, FileTextOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Empty, Form, Input, Modal, Pagination, Row, Skeleton, Space, Tag, Tooltip, Typography, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiClient, { apiErrorMessage } from '../api/apiClient';
import { useI18n } from '../useI18n';

const getUser = () => {
  try { return JSON.parse(sessionStorage.getItem('assessment_user')) || null; } catch { return null; }
};

export default function AssessmentList() {
  const { t } = useI18n();
  const locale = useLocation().pathname.split('/')[1] || 'vi';
  const navigate = useNavigate();
  const user = getUser();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const canCreate = user?.permissions?.actions?.assessment?.create;
  const canEdit = user?.permissions?.actions?.assessment?.edit;
  const canDelete = user?.permissions?.actions?.assessment?.delete;

  const load = useCallback(async () => {
    setState('loading');
    try {
      const response = await apiClient.get('/assessment/v1/assessments', { params: { page, per_page: 9, search: query } });
      setItems(response.data);
      setTotal(Number(response.headers['x-wp-total'] || 0));
      setState('ready');
    } catch (err) {
      setError(apiErrorMessage(err, t));
      setState('error');
    }
  }, [page, query, t]);

  useEffect(() => { load(); }, [load]);

  const submitSearch = () => { setPage(1); setQuery(search.trim()); };
  const resetSearch = () => {
    const hasActiveSearch = Boolean(search || query || page !== 1);
    setSearch('');
    setQuery('');
    setPage(1);
    if (!hasActiveSearch) load();
  };
  const closeModal = () => {
    setOpen(false);
    setEditingAssessment(null);
    form.resetFields();
  };
  const openCreateModal = () => {
    setEditingAssessment(null);
    form.resetFields();
    setOpen(true);
  };
  const openEditModal = (item) => {
    setEditingAssessment(item);
    form.setFieldsValue({ title: item.title, description: item.description });
    setOpen(true);
  };
  const save = async (values) => {
    setSaving(true);
    try {
      if (editingAssessment) {
        await apiClient.patch(`/assessment/v1/assessments/${editingAssessment.id}`, { ...values, status: editingAssessment.status });
        message.success(t('updateSuccess'));
      } else {
        await apiClient.post('/assessment/v1/assessments', { ...values, status: 'publish' });
        message.success(t('createSuccess'));
      }
      closeModal();
      setPage(1);
      load();
    } catch (err) {
      message.error(apiErrorMessage(err, t));
    } finally {
      setSaving(false);
    }
  };
  const deleteAssessment = (item) => {
    Modal.confirm({
      title: t('deleteAssessment'),
      content: t('deleteAssessmentConfirm', { title: item.title }),
      okText: t('delete'),
      okButtonProps: { danger: true },
      cancelText: t('cancel'),
      onOk: async () => {
        try {
          await apiClient.delete(`/assessment/v1/assessments/${item.id}`);
          message.success(t('deleteSuccess'));
          load();
        } catch (err) {
          message.error(apiErrorMessage(err, t));
        }
      },
    });
  };
  const openAssessment = (item) => navigate(`/${locale}/assessment/${item.id}`);

  return <section className="page-wrap">
    <div className="hero-panel"><div><Tag>{t('learningHub')}</Tag><Typography.Title>{t('discover')}</Typography.Title><Typography.Paragraph>{t('discoverHint')}</Typography.Paragraph><Tag icon={<UserOutlined />}>{user?.display_name || t('publicCatalog')}</Tag></div><FileTextOutlined className="hero-icon" /></div>
    <div className="section-heading"><div><Typography.Title level={2}>{t('assessments')}</Typography.Title><Typography.Text type="secondary">{t('assessmentsHint')}</Typography.Text></div><Space>{canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>{t('createAssessment')}</Button>}<Tag className="count-tag">{total} {t('published')}</Tag></Space></div>
    <Space.Compact className="list-search"><Input.Search value={search} onChange={(event) => setSearch(event.target.value)} onSearch={submitSearch} placeholder={t('searchAssessments')} enterButton={<SearchOutlined />} allowClear /><Button icon={<ReloadOutlined />} onClick={resetSearch}>{t('resetSearch')}</Button></Space.Compact>
    {state === 'loading' && <Skeleton active />}
    {state === 'error' && <Alert type="error" message={error} action={<Button onClick={load}>{t('retry')}</Button>} />}
    {state === 'ready' && !items.length && <Empty description={t('noAssessments')} />}
    {state === 'ready' && <Row gutter={[20, 20]}>{items.map((item) => <Col xs={24} md={12} lg={8} key={item.id}><Card className="assessment-card assessment-card-clickable" hoverable role="link" tabIndex={0} aria-label={`${t('openAssessment')}: ${item.title}`} onClick={() => openAssessment(item)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openAssessment(item); } }}><FileTextOutlined className="assessment-icon" /><Typography.Title level={4}>{item.title}</Typography.Title><Typography.Paragraph ellipsis={{ rows: 3 }}>{item.description || t('noDescription')}</Typography.Paragraph><div className="assessment-card-footer"><Link className="card-link" to={`/${locale}/assessment/${item.id}`} aria-label={`${t('openAssessment')}: ${item.title}`} onClick={(event) => event.stopPropagation()}>{t('openAssessment')} <ArrowRightOutlined /></Link>{(canEdit || canDelete) && <Space size={4}>{canEdit && <Tooltip title={t('editAssessment')}><Button type="text" shape="circle" icon={<EditOutlined />} aria-label={`${t('editAssessment')}: ${item.title}`} onClick={(event) => { event.stopPropagation(); openEditModal(item); }} /></Tooltip>}{canDelete && <Tooltip title={t('deleteAssessment')}><Button type="text" danger shape="circle" icon={<DeleteOutlined />} aria-label={`${t('deleteAssessment')}: ${item.title}`} onClick={(event) => { event.stopPropagation(); deleteAssessment(item); }} /></Tooltip>}</Space>}</div></Card></Col>)}</Row>}
    {total > 9 && <Pagination className="list-pagination" current={page} pageSize={9} total={total} showSizeChanger={false} onChange={setPage} />}
    <Modal title={<Space><FileAddOutlined />{editingAssessment ? t('editAssessment') : t('createAssessmentNew')}</Space>} open={open} onCancel={closeModal} footer={null} destroyOnHidden><Form form={form} layout="vertical" onFinish={save}><Form.Item name="title" label={t('assessmentTitle')} rules={[{ required: true, message: t('titleRequired') }]}><Input placeholder={t('titlePlaceholder')} /></Form.Item><Form.Item name="description" label={t('description')}><Input.TextArea rows={4} placeholder={t('descriptionPlaceholder')} /></Form.Item><Button type="primary" htmlType="submit" loading={saving} block>{editingAssessment ? t('saveChanges') : t('createAssessment')}</Button></Form></Modal>
  </section>;
}
