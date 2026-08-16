import { ArrowLeftOutlined, ClockCircleOutlined, FormOutlined, PlusOutlined, ReloadOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Avatar, Button, Card, Collapse, Empty, Form, Input, Modal, Result, Select, Skeleton, Space, Tag, Typography, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient, { apiErrorMessage } from '../api/apiClient';
import { useI18n } from '../i18n';

const getUser = () => { try { return JSON.parse(sessionStorage.getItem('assessment_user')) || null; } catch { return null; } };
const authorInitial = (name) => name?.trim().charAt(0).toUpperCase() || 'H';
const parseWpUtcDate = (value) => {
  if (!value) return null;
  const normalized = value.replace(' ', 'T');
  return new Date(/[zZ]$|[+-]\d{2}:\d{2}$/.test(normalized) ? normalized : `${normalized}Z`);
};
const formatAnswerTime = (value) => {
  const date = parseWpUtcDate(value);
  return date && !Number.isNaN(date.getTime()) ? new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'medium', timeStyle: 'short' }).format(date) : '';
};

export default function AssessmentDetail() {
  const { id } = useParams();
  const { t } = useI18n();
  const [assessment, setAssessment] = useState(null); const [questions, setQuestions] = useState([]); const [state, setState] = useState('loading'); const [error, setError] = useState('');
  const [questionSaving, setQuestionSaving] = useState(false); const [answerSaving, setAnswerSaving] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false); const [answerModalOpen, setAnswerModalOpen] = useState(false); const [selectedQuestion, setSelectedQuestion] = useState(null); const [questionSort, setQuestionSort] = useState('default'); const [questionFilter, setQuestionFilter] = useState('all');
  const [questionForm] = Form.useForm(); const [answerForm] = Form.useForm(); const user = getUser();

  const load = useCallback(async () => {
    setState('loading'); setError('');
    try {
      const [assessmentResponse, questionResponse] = await Promise.all([apiClient.get(`/assessment/v1/assessments/${id}`), apiClient.get(`/assessment/v1/assessments/${id}/questions`)]);
      const populated = await Promise.all(questionResponse.data.map(async (question) => ({ ...question, answers: (await apiClient.get(`/assessment/v1/questions/${question.id}/answers`)).data })));
      setAssessment(assessmentResponse.data); setQuestions(populated); setState('ready');
    } catch (err) { setError(apiErrorMessage(err, t)); setState('error'); }
  }, [id, t]);

  useEffect(() => { load(); }, [load]);

  const createQuestion = async ({ content }) => {
    setQuestionSaving(true);
    try {
      await apiClient.post('/assessment/v1/questions', { assessment_id: Number(id), content, status: 'publish' });
      questionForm.resetFields(); setQuestionModalOpen(false); message.success(t('questionSuccess')); load();
    } catch (err) { const errorMessage = apiErrorMessage(err, t); questionForm.setFields([{ name: 'content', errors: [errorMessage] }]); message.error(errorMessage); } finally { setQuestionSaving(false); }
  };

  const openAnswerModal = (question) => { setSelectedQuestion(question); answerForm.resetFields(); setAnswerModalOpen(true); };
  const createAnswer = async ({ content }) => {
    if (!selectedQuestion) return;
    setAnswerSaving(true);
    try {
      await apiClient.post('/assessment/v1/answers', { question_id: Number(selectedQuestion.id), content });
      answerForm.resetFields(); setAnswerModalOpen(false); setSelectedQuestion(null); message.success(t('answerSuccess')); load();
    } catch (err) { const errorMessage = apiErrorMessage(err, t); answerForm.setFields([{ name: 'content', errors: [errorMessage] }]); message.error(errorMessage); } finally { setAnswerSaving(false); }
  };
  const changeQuestionFilter = (value) => { setQuestionFilter(value); message.info({ content: `Đang hiển thị: ${{ all: 'Tất cả câu hỏi', answered: 'Câu hỏi đã trả lời', unanswered: 'Câu hỏi chưa trả lời' }[value]}`, key: 'question-filter' }); };
  const changeQuestionSort = (value) => { setQuestionSort(value); message.info({ content: `Đã sắp xếp: ${{ default: 'Thứ tự mặc định', newest: 'Mới nhất', oldest: 'Cũ nhất' }[value]}`, key: 'question-sort' }); };

  if (state === 'loading') return <section className="page-wrap detail-loading"><Skeleton active title paragraph={{ rows: 10 }} /></section>;
  if (state === 'error') return <section className="page-wrap"><Result status="404" title="Không thể mở bài đánh giá" subTitle={error} extra={<Space><Button icon={<ReloadOutlined />} onClick={load}>Thử lại</Button><Link to="/"><Button type="primary">Về danh sách</Button></Link></Space>} /></section>;

  const visibleQuestions = questions.filter((question) => {
    if (questionFilter === 'answered') return question.answers.length > 0;
    if (questionFilter === 'unanswered') return question.answers.length === 0;
    return true;
  });
  const sortedQuestions = [...visibleQuestions].sort((first, second) => {
    if (questionSort === 'newest') return new Date(second.created_at.replace(' ', 'T')) - new Date(first.created_at.replace(' ', 'T'));
    if (questionSort === 'oldest') return new Date(first.created_at.replace(' ', 'T')) - new Date(second.created_at.replace(' ', 'T'));
    return Number(first.sort_order || 0) - Number(second.sort_order || 0) || Number(first.id) - Number(second.id);
  });
  const items = sortedQuestions.map((question, index) => {
    const hasAnswer = question.answers.length > 0;
    return {
      key: String(question.id),
      label: <div className="collapse-question-label"><span className="question-number">{String(index + 1).padStart(2, '0')}</span><div className="question-header-content"><div className="question-content" dangerouslySetInnerHTML={{ __html: question.content }} /><div className="question-author"><Avatar size={24} src={question.author_avatar || undefined} icon={!question.author_avatar && <UserOutlined />}>{!question.author_avatar && authorInitial(question.author_name)}</Avatar><span>{question.author_name || t('system')}</span><span className="author-time"><ClockCircleOutlined /> {formatAnswerTime(question.created_at)}</span></div></div></div>,
      children: <div className="dropdown-answers">{hasAnswer ? question.answers.map((answer) => <article className="answer-comment" key={answer.id}><Avatar size={38} src={answer.author_avatar || undefined} icon={!answer.author_avatar && <UserOutlined />}>{!answer.author_avatar && authorInitial(answer.author_name)}</Avatar><div className="answer-comment-body"><div className="answer-meta"><Typography.Text strong>{answer.author_name || t('system')}</Typography.Text><span><ClockCircleOutlined /> {formatAnswerTime(answer.created_at)}</span></div><div className="answer-text" dangerouslySetInnerHTML={{ __html: answer.content }} /></div></article>) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('noAnswers')} />}{(user?.permissions?.actions?.answer?.create ?? user?.permissions?.answer) && <div className="answer-action"><Button type="primary" icon={<SendOutlined />} onClick={() => openAnswerModal(question)}>{t('answerQuestion')}</Button></div>}</div>,
    };
  });

  return <section className="page-wrap assessment-detail-page"><Link className="back-link detail-back" to="/"><ArrowLeftOutlined /> Về danh sách bài đánh giá</Link><Card className="assessment-cover" bordered={false}><div className="cover-content"><Tag bordered={false}>BÀI ĐÁNH GIÁ</Tag><Typography.Title>{assessment.title}</Typography.Title><Typography.Paragraph>{assessment.description || 'Chưa có mô tả cho bài đánh giá này.'}</Typography.Paragraph><Space size={[20, 10]} wrap><span className="cover-stat"><FormOutlined /> {questions.length} câu hỏi</span><span className="cover-stat"><ClockCircleOutlined /> Tự do thực hiện</span></Space></div></Card><div className="questions-heading"><div><Typography.Title level={2}>Câu hỏi</Typography.Title><Typography.Text type="secondary">Nhấn vào câu hỏi để xem câu trả lời của người dùng.</Typography.Text></div><Space size={10} wrap><Select aria-label="Lọc câu hỏi" value={questionFilter} onChange={changeQuestionFilter} style={{ width: 156 }} options={[{ value: 'all', label: 'Tất cả câu hỏi' }, { value: 'answered', label: 'Đã trả lời' }, { value: 'unanswered', label: 'Chưa trả lời' }]} /><Select aria-label="Sắp xếp câu hỏi" value={questionSort} onChange={changeQuestionSort} style={{ width: 168 }} options={[{ value: 'default', label: 'Thứ tự mặc định' }, { value: 'newest', label: 'Mới nhất' }, { value: 'oldest', label: 'Cũ nhất' }]} />{user?.permissions?.question && <Button className="add-question-button" type="primary" icon={<PlusOutlined />} onClick={() => setQuestionModalOpen(true)}>Gửi câu hỏi</Button>}<Tag className="question-count">{visibleQuestions.length}/{questions.length} câu</Tag></Space></div>{questions.length ? <div className="question-list">{items.length ? items.map((item) => <Collapse className="question-dropdown" items={[item]} key={item.key} defaultActiveKey={items.length === 1 ? [item.key] : []} />) : <Empty className="detail-empty" description="Không có câu hỏi phù hợp với bộ lọc." />}</div> : <Empty className="detail-empty" description="Chưa có câu hỏi nào được xuất bản." />}<Modal open={questionModalOpen} title={<Space><PlusOutlined />Gửi câu hỏi mới</Space>} onCancel={() => setQuestionModalOpen(false)} footer={null} destroyOnHidden><Alert className="draft-note" type="success" showIcon message="Câu hỏi sẽ được xuất bản ngay sau khi gửi." /><Form form={questionForm} layout="vertical" requiredMark={false} onFinish={createQuestion}><Form.Item name="content" label="Nội dung câu hỏi" rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi.' }]}><Input.TextArea rows={5} placeholder="Nhập câu hỏi hiển thị cho người học" /></Form.Item><Button type="primary" htmlType="submit" loading={questionSaving} block>Gửi câu hỏi</Button></Form></Modal><Modal open={answerModalOpen} title={<Space><SendOutlined />Trả lời câu hỏi</Space>} onCancel={() => { setAnswerModalOpen(false); setSelectedQuestion(null); }} footer={null} destroyOnHidden><div className="answer-question-preview"><Typography.Text type="secondary">CÂU HỎI CẦN TRẢ LỜI</Typography.Text><div dangerouslySetInnerHTML={{ __html: selectedQuestion?.content || '' }} /></div><Form form={answerForm} layout="vertical" requiredMark={false} onFinish={createAnswer}><Form.Item name="content" label="Nội dung trả lời" rules={[{ required: true, message: 'Vui lòng nhập nội dung trả lời.' }]}><Input.TextArea rows={5} placeholder="Nhập câu trả lời của bạn" autoFocus /></Form.Item><Button type="primary" htmlType="submit" loading={answerSaving} block icon={<SendOutlined />}>Gửi câu trả lời</Button></Form></Modal></section>;
}
