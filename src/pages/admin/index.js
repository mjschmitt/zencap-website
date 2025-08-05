import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Layout from '../../components/layout/Layout';

// Chart components
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// ZenCap brand colors
const COLORS = ['#046B4E', '#3e6792', '#6187ad', '#8ba8c2', '#bccddc'];

import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(
  () => import('@/components/ui/RichTextEditor'),
  { 
    ssr: false,
    loading: () => <div className="p-4 text-center text-gray-500">Loading editor...</div>
  }
);

const ExcelPreview = dynamic(
  () => import('@/components/ui/ExcelPreview'),
  { 
    ssr: false,
    loading: () => <div className="p-4 text-center text-gray-500">Loading Excel preview...</div>
  }
);

function InsightsAdmin() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editInsight, setEditInsight] = useState(null);
  const [editingInsightId, setEditingInsightId] = useState(null);
  const [form, setForm] = useState({
    slug: '', title: '', summary: '', content: '', author: '', cover_image_url: '', status: 'draft', tags: '', date_published: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchInsights(); }, []);

  const fetchInsights = async () => {
    setLoading(true);
    const res = await fetch('/api/insights?admin=true');
    const data = await res.json();
    setInsights(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setEditInsight(null);
    setEditingInsightId(null);
    setForm({ 
      slug: '', 
      title: '', 
      summary: '', 
      content: getSampleContent(), 
      author: '', 
      cover_image_url: '', 
      status: 'draft', 
      tags: '',
      date_published: ''
    });
    setShowForm(true);
    setError('');
  };

  const handleEdit = (insight) => {
    if (editingInsightId === insight.id && showForm) {
      // Close if already editing this insight
      setShowForm(false);
      setEditingInsightId(null);
      setEditInsight(null);
    } else {
      setEditInsight(insight);
      setEditingInsightId(insight.id);
      // Format date for input field
      const formattedDate = insight.date_published ? new Date(insight.date_published).toISOString().split('T')[0] : '';
      setForm({ 
        ...insight, 
        date_published: formattedDate
      });
      setShowForm(true);
      setError('');
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm('Delete this insight?')) return;
    await fetch('/api/insights', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
    fetchInsights();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const method = editInsight ? 'PUT' : 'POST';
    const res = await fetch('/api/insights', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      setError('Failed to save.');
      setSaving(false);
      return;
    }
    setShowForm(false);
    setEditingInsightId(null);
    setSaving(false);
    fetchInsights();
  };

  // Format date for display
  const formatDateForDisplay = (dateString, status) => {
    if (status === 'draft') return 'TBD';
    if (!dateString) return 'No date';
    
    try {
      // Parse the date string and format it properly
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC' // Use UTC to avoid timezone conversion issues
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Sample professional content template showcasing all editor features
  const getSampleContent = () => {
    return `<h1>Investment Strategy Analysis: Q4 2024 Market Outlook</h1>

<div class="callout-box">
  <strong>Executive Summary:</strong> This comprehensive analysis examines key market trends, investment opportunities, and risk factors for the fourth quarter of 2024, providing actionable insights for portfolio optimization.
</div>

<h2>Market Overview</h2>

<p>The current market environment presents both <strong>significant opportunities</strong> and <em>notable challenges</em> for investors. Our analysis indicates three primary factors driving market dynamics:</p>

<ul>
  <li><strong>Technology Sector Momentum:</strong> Continued innovation in AI and cloud computing</li>
  <li><strong>Interest Rate Environment:</strong> Federal Reserve policy implications</li>
  <li><strong>Global Economic Recovery:</strong> Post-pandemic growth patterns</li>
</ul>

<h3>Key Investment Themes</h3>

<p>We've identified several compelling investment themes that warrant attention:</p>

<ol>
  <li><span style="color: #046B4E;">Green Energy Transition</span> - Renewable energy infrastructure</li>
  <li><span style="color: #3B82F6;">Digital Transformation</span> - Cloud and cybersecurity</li>
  <li><span style="color: #8B5CF6;">Healthcare Innovation</span> - Biotech and telemedicine</li>
</ol>

<h2>Portfolio Recommendations</h2>

<blockquote>
  "Diversification remains the cornerstone of successful portfolio management. Our analysis suggests a balanced approach combining growth and value strategies."
</blockquote>

<p>Based on our comprehensive analysis, we recommend the following portfolio allocation for Q4 2024:</p>

<h3>Recommended Asset Allocation</h3>

<table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;">
  <thead>
    <tr style="background-color: #f8f9fa;">
      <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: left;">Asset Class</th>
      <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Target Allocation</th>
      <th style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Risk Level</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #dee2e6; padding: 0.75rem;">Large Cap Equities</td>
      <td style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">35%</td>
      <td style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Medium</td>
    </tr>
    <tr style="background-color: #f8f9fa;">
      <td style="border: 1px solid #dee2e6; padding: 0.75rem;">Technology Sector</td>
      <td style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">25%</td>
      <td style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">High</td>
    </tr>
    <tr>
      <td style="border: 1px solid #dee2e6; padding: 0.75rem;">Fixed Income</td>
      <td style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">20%</td>
      <td style="border: 1px solid #dee2e6; padding: 0.75rem; text-align: center;">Low</td>
    </tr>
  </tbody>
</table>

<div style="background-color: #e7f3ff; border-left: 4px solid #2196F3; padding: 1rem; margin: 1.5rem 0;">
  <h4 style="color: #1976D2; margin-top: 0;">Key Insight</h4>
  <p style="margin-bottom: 0;">The technology sector continues to demonstrate resilience and growth potential, making it an attractive component for long-term portfolio construction.</p>
</div>

<h2>Risk Considerations</h2>

<p>While we maintain an optimistic outlook, investors should be aware of several key risk factors:</p>

<ul>
  <li><strong>Inflation Persistence:</strong> Continued monitoring of inflation trends and Federal Reserve responses</li>
  <li><strong>Geopolitical Tensions:</strong> Ongoing global conflicts and trade relationships</li>
  <li><strong>Market Volatility:</strong> Potential for increased volatility during earnings season</li>
</ul>

<hr style="margin: 2rem 0; border: none; border-top: 2px solid #e9ecef;">

<p><em>This analysis is for informational purposes only and should not be considered as personalized investment advice. Please consult with a qualified financial advisor before making investment decisions.</em></p>`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Insights</h3>
        <button onClick={handleAdd} className="bg-teal-600 dark:bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-700 dark:hover:bg-teal-600">Add Insight</button>
      </div>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-4">
          {/* Table header */}
          <div className="bg-gray-50 dark:bg-navy-700 rounded-t-lg">
            <div className="grid gap-4 px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase" style={{gridTemplateColumns: '3fr 1.5fr 1fr 1.5fr 1fr'}}>
              <div>Title</div>
              <div>Slug</div>
              <div>Status</div>
              <div>Date</div>
              <div className="text-right">Actions</div>
            </div>
          </div>
          
          {/* Insights list with inline editors */}
          <div className="bg-white dark:bg-navy-800 rounded-b-lg border border-gray-200 dark:border-navy-700">
            {insights.map((insight, index) => (
              <div key={insight.id}>
                {/* Insight row */}
                <div className={`grid gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-navy-700 ${index !== insights.length - 1 ? 'border-b border-gray-200 dark:border-navy-700' : ''}`} style={{gridTemplateColumns: '3fr 1.5fr 1fr 1.5fr 1fr'}}>
                  <div className="text-gray-900 dark:text-white truncate">{insight.title}</div>
                  <div className="text-gray-500 dark:text-gray-400 truncate">{insight.slug}</div>
                  <div className="text-gray-500 dark:text-gray-400">{insight.status}</div>
                  <div className="text-gray-500 dark:text-gray-400">{formatDateForDisplay(insight.date_published, insight.status)}</div>
                  <div className="flex justify-end gap-2">
                     <button 
                       onClick={() => handleEdit(insight)} 
                       className={`px-3 py-1 rounded text-sm transition ${
                         editingInsightId === insight.id && showForm 
                           ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                           : 'bg-blue-600 hover:bg-blue-700 text-white'
                       }`}
                     >
                       {editingInsightId === insight.id && showForm ? 'Close' : 'Edit'}
                     </button>
                     <button onClick={() => handleDelete(insight.slug)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">Delete</button>
                   </div>
                </div>
                
                {/* Editor appears directly below this insight when editing */}
                {editingInsightId === insight.id && showForm && (
                  <div className="border-t border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-900">
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label htmlFor="insight-title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Title</label>
                          <input id="insight-title" name="title" value={form.title} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white" required />
                        </div>
                        <div>
                          <label htmlFor="insight-slug" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Slug</label>
                          <input id="insight-slug" name="slug" value={form.slug} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white" required disabled={!!editInsight} />
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Content</label>
                        {isClient && (
                          <RichTextEditor
                            key={editInsight?.slug || 'new-insight'}
                            initialContent={form.content}
                            onChange={html => setForm(f => ({ ...f, content: html }))}
                          />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label htmlFor="insight-summary" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Summary</label>
                          <input id="insight-summary" name="summary" value={form.summary} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                          <label htmlFor="insight-author" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Author</label>
                          <input id="insight-author" name="author" value={form.author} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                          <label htmlFor="insight-cover-image-url" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Cover Image URL</label>
                          <input id="insight-cover-image-url" name="cover_image_url" value={form.cover_image_url} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                          <label htmlFor="insight-status" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
                          <select id="insight-status" name="status" value={form.status} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white">
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="insight-date-published" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Date Published</label>
                          <input 
                            id="insight-date-published" 
                            name="date_published" 
                            type="date" 
                            value={form.date_published} 
                            onChange={handleFormChange} 
                            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white" 
                          />
                        </div>
                        <div>
                          <label htmlFor="insight-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Tags (comma separated)</label>
                          <input id="insight-tags" name="tags" value={form.tags} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white" />
                        </div>
                      </div>
                      {error && <div className="text-red-600 dark:text-red-400">{error}</div>}
                      <div className="flex gap-2 pt-4">
                        <button type="submit" className="bg-teal-600 dark:bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-700 dark:hover:bg-teal-600" disabled={saving}>
                          {saving ? 'Saving...' : (editInsight ? 'Update' : 'Create')}
                        </button>
                        <button type="button" onClick={() => { setShowForm(false); setEditingInsightId(null); }} className="bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-navy-600">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {showForm && !editingInsightId && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-navy-800 p-6 rounded shadow border border-gray-200 dark:border-navy-700 space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="insight-title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Title</label>
              <input id="insight-title" name="title" value={form.title} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white" required />
            </div>
            <div>
              <label htmlFor="insight-slug" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Slug</label>
              <input id="insight-slug" name="slug" value={form.slug} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white" required disabled={!!editInsight} />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Content</label>
            {isClient && (
              <RichTextEditor
                key={editInsight?.slug || 'new-insight'}
                initialContent={form.content}
                onChange={html => setForm(f => ({ ...f, content: html }))}
              />
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="insight-summary" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Summary</label>
              <input id="insight-summary" name="summary" value={form.summary} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label htmlFor="insight-author" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Author</label>
              <input id="insight-author" name="author" value={form.author} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label htmlFor="insight-cover-image-url" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Cover Image URL</label>
              <input id="insight-cover-image-url" name="cover_image_url" value={form.cover_image_url} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label htmlFor="insight-status" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
              <select id="insight-status" name="status" value={form.status} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label htmlFor="insight-date-published" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Date Published</label>
              <input 
                id="insight-date-published" 
                name="date_published" 
                type="date" 
                value={form.date_published} 
                onChange={handleFormChange} 
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white" 
              />
            </div>
            <div>
              <label htmlFor="insight-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Tags (comma separated)</label>
              <input id="insight-tags" name="tags" value={form.tags} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white" />
            </div>
          </div>
          {error && <div className="text-red-600 dark:text-red-400">{error}</div>}
          <div className="flex gap-2 pt-4">
            <button type="submit" className="bg-teal-600 dark:bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-700 dark:hover:bg-teal-600" disabled={saving}>
              {saving ? 'Saving...' : (editInsight ? 'Update' : 'Create')}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingInsightId(null); }} className="bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-navy-600">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function ModelsAdmin() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editModel, setEditModel] = useState(null);
  const [editingModelId, setEditingModelId] = useState(null);
  const [form, setForm] = useState({
    slug: '', title: '', description: '', category: '', thumbnail_url: '', file_url: '', price: '', status: 'active', tags: '', excel_url: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showExcelPreview, setShowExcelPreview] = useState(false);
  const [newlyUploadedFile, setNewlyUploadedFile] = useState(false);

  useEffect(() => { fetchModels(); }, []);

  const fetchModels = async () => {
    setLoading(true);
    const res = await fetch('/api/models');
    const data = await res.json();
    if (Array.isArray(data)) {
      setModels(data);
    } else if (data && Array.isArray(data.models)) {
      setModels(data.models);
    } else {
      setModels([]);
    }
    setLoading(false);
  };

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExcelUpload = async (file) => {
    if (!file) return;

    console.log('Starting Excel upload for file:', file.name, 'Size:', file.size);
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Sending upload request to /api/upload-excel');
      const response = await fetch('/api/upload-excel-simple', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);
      const result = await response.json();
      console.log('Upload result:', result);

      if (result.success) {
        setForm(f => ({ ...f, excel_url: result.file.path }));
        setNewlyUploadedFile(true); // Mark as newly uploaded
        setShowExcelPreview(true); // Automatically show preview for new uploads
        setError('');
        console.log('Excel upload successful, file path:', result.file.path);
      } else {
        console.error('Upload failed:', result.error);
        setError(result.error || 'Failed to upload Excel file');
      }
    } catch (err) {
      console.error('Excel upload error:', err);
      setError(`Failed to upload Excel file: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = () => {
    setEditModel(null);
    setEditingModelId(null);
    setForm({ 
      slug: '', 
      title: '', 
      description: '<p>Enter a comprehensive description of this financial model, including its key features, use cases, and benefits.</p>', 
      category: '', 
      thumbnail_url: '', 
      file_url: '', 
      price: '', 
      status: 'active', 
      tags: '',
      excel_url: ''
    });
    setShowForm(true);
    setShowExcelPreview(false);
    setNewlyUploadedFile(false); // Reset for new model
    setError('');
  };

  const handleEdit = (model) => {
    if (editingModelId === model.id && showForm) {
      // Close if already editing this model
      setShowForm(false);
      setEditingModelId(null);
      setEditModel(null);
    } else {
    setEditModel(model);
      setEditingModelId(model.id);
      setForm({ 
        ...model, 
        description: model.description || '<p>Enter a comprehensive description of this financial model, including its key features, use cases, and benefits.</p>',
        excel_url: model.excel_url || ''
      });
    setShowForm(true);
    setNewlyUploadedFile(false); // Reset for existing model
    setError('');
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm('Delete this model?')) return;
    await fetch('/api/models', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
    fetchModels();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const method = editModel ? 'PUT' : 'POST';
    const res = await fetch('/api/models', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      setError('Failed to save.');
      setSaving(false);
      return;
    }
    setShowForm(false);
    setEditingModelId(null);
    setSaving(false);
    fetchModels();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Models</h3>
        <button onClick={handleAdd} className="bg-teal-600 dark:bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-700 dark:hover:bg-teal-600">Add Model</button>
      </div>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-4">
          {/* Table header */}
          <div className="bg-gray-50 dark:bg-navy-700 rounded-t-lg">
            <div className="grid gap-4 px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase" style={{gridTemplateColumns: '3fr 1.5fr 1fr 1fr 1fr'}}>
              <div>Title</div>
              <div>Slug</div>
              <div>Category</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>
          </div>
          
          {/* Models list with inline editors */}
          <div className="bg-white dark:bg-navy-800 rounded-b-lg border border-gray-200 dark:border-navy-700">
            {models.map((model, index) => (
              <div key={model.id}>
                {/* Model row */}
                <div className={`grid gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-navy-700 ${index !== models.length - 1 ? 'border-b border-gray-200 dark:border-navy-700' : ''}`} style={{gridTemplateColumns: '3fr 1.5fr 1fr 1fr 1fr'}}>
                  <div className="text-gray-900 dark:text-white truncate">{model.title}</div>
                  <div className="text-gray-500 dark:text-gray-400 truncate">{model.slug}</div>
                  <div className="text-gray-500 dark:text-gray-400">{model.category}</div>
                  <div className="text-gray-500 dark:text-gray-400">{model.status}</div>
                  <div className="flex justify-end gap-2">
                     <button 
                       onClick={() => handleEdit(model)} 
                       className={`px-3 py-1 rounded text-sm transition ${
                         editingModelId === model.id && showForm 
                           ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                           : 'bg-blue-600 hover:bg-blue-700 text-white'
                       }`}
                     >
                       {editingModelId === model.id && showForm ? 'Close' : 'Edit'}
                     </button>
                     <button onClick={() => handleDelete(model.slug)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">Delete</button>
                   </div>
                </div>
                
                {/* Editor appears directly below this model when editing */}
                {editingModelId === model.id && showForm && (
                  <div className="border-t border-gray-200 dark:border-navy-700 bg-gray-50 dark:bg-navy-900">
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="model-title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Title</label>
                          <input id="model-title" name="title" value={form.title} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white" required />
                        </div>
                        <div>
                          <label htmlFor="model-slug" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Slug</label>
                          <input id="model-slug" name="slug" value={form.slug} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white" required disabled={!!editModel} />
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Content</label>
                        {isClient && (
                          <RichTextEditor
                            key={editModel?.slug || 'new-model'}
                            initialContent={form.description}
                            onChange={html => setForm(f => ({ ...f, description: html }))}
                          />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label htmlFor="model-category" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Category</label>
                          <input id="model-category" name="category" value={form.category} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                          <label htmlFor="model-thumbnail-url" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Thumbnail URL</label>
                          <input id="model-thumbnail-url" name="thumbnail_url" value={form.thumbnail_url} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                          <label htmlFor="model-file-url" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">File URL</label>
                          <div className="flex gap-2">
                            <input
                              id="model-file-url"
                              name="file_url"
                              value={form.file_url}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white"
                            />
                                            <input
                  type="file"
                  accept=".xlsx,.xls,.xlsm,.csv"
                  style={{ display: 'none' }}
                  id="model-file-upload"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const url = `/models/${file.name}`;
                      setForm(f => ({ ...f, file_url: url }));
                    }
                  }}
                />
                            <button
                              type="button"
                              className="bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-navy-600 text-xs"
                              onClick={() => document.getElementById('model-file-upload').click()}
                            >
                              Browse
                            </button>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="model-price" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Price</label>
                          <input id="model-price" name="price" value={form.price} onChange={handleFormChange} type="number" step="0.01" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                          <label htmlFor="model-status" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
                          <select id="model-status" name="status" value={form.status} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="model-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Tags (comma separated)</label>
                          <input id="model-tags" name="tags" value={form.tags} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Excel File Upload
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-2">(For interactive preview)</span>
                          </label>
                          <div className="space-y-3">
                            <div className="flex gap-2">
                                                <input
                    type="file"
                    accept=".xlsx,.xls,.xlsm"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleExcelUpload(e.target.files[0]);
                      }
                    }}
                                className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                disabled={uploading}
                              />
                              {uploading && (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>
                                </div>
                              )}
                            </div>

                            {form.excel_url && newlyUploadedFile && (
                              <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="flex items-center">
                                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-sm text-green-700 dark:text-green-300">Excel file uploaded successfully</span>
                                </div>
                              </div>
                            )}
                            {form.excel_url && !newlyUploadedFile && (
                              <div className="flex items-center p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-xs text-blue-700 dark:text-blue-300">Excel file available for preview</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowExcelPreview(!showExcelPreview);
                                    // If showing preview, scroll to it after a brief delay for render
                                    if (!showExcelPreview) {
                                      setTimeout(() => {
                                        const element = document.getElementById('excel-preview-container');
                                        if (element) {
                                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }
                                      }, 100);
                                    }
                                  }}
                                  className={`ml-auto text-xs px-2 py-1 rounded transition-colors ${
                                    showExcelPreview 
                                      ? 'bg-gray-600 text-white hover:bg-gray-700' // Hide Preview - gray like close buttons
                                      : 'bg-navy-700 text-white hover:bg-navy-800' // Preview Model - dark navy
                                  }`}
                                >
                                  {showExcelPreview ? 'Hide Preview' : 'Preview Model'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {error && <div className="text-red-600 dark:text-red-400">{error}</div>}
                      
                      {/* Excel Preview Section - MOVED to appear after success banner */}
                      {showExcelPreview && form.excel_url && isClient && (
                        <div id="excel-preview-container" className="bg-white dark:bg-navy-800 p-6 rounded shadow border border-gray-200 dark:border-navy-700 space-y-4 mb-6">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Model Viewer
                            </h4>
                            <button
                              onClick={() => setShowExcelPreview(false)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <ExcelPreview
                            file={form.excel_url}
                            modelId={form.id}
                            title={form.title || "Model Preview"}
                            height="850px"
                            preferInteractive={false}
                          />
                        </div>
                      )}
                      

                      
                      <div className="flex gap-2 pt-4">
                        <button type="submit" className="bg-teal-600 dark:bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-700 dark:hover:bg-teal-600" disabled={saving}>
                          {saving ? 'Saving...' : (editModel ? 'Update' : 'Create')}
                        </button>
                        <button type="button" onClick={() => { setShowForm(false); setEditingModelId(null); }} className="bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-navy-600">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {showForm && !editingModelId && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-navy-800 p-6 rounded shadow border border-gray-200 dark:border-navy-700 space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="model-title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Title</label>
              <input id="model-title" name="title" value={form.title} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white" required />
            </div>
            <div>
              <label htmlFor="model-slug" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Slug</label>
              <input id="model-slug" name="slug" value={form.slug} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white" required disabled={!!editModel} />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Content</label>
            {isClient && (
              <RichTextEditor
                key={editModel?.slug || 'new-model'}
                initialContent={form.description}
                onChange={html => setForm(f => ({ ...f, description: html }))}
              />
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="model-category" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Category</label>
              <input id="model-category" name="category" value={form.category} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label htmlFor="model-thumbnail-url" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Thumbnail URL</label>
              <input id="model-thumbnail-url" name="thumbnail_url" value={form.thumbnail_url} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label htmlFor="model-file-url" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">File URL</label>
              <div className="flex gap-2">
                <input
                  id="model-file-url"
                  name="file_url"
                  value={form.file_url}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white"
                />
                <input
                  type="file"
                  accept=".xlsx,.xls,.xlsm,.csv"
                  style={{ display: 'none' }}
                  id="model-file-upload"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const url = `/models/${file.name}`;
                      setForm(f => ({ ...f, file_url: url }));
                    }
                  }}
                />
                <button
                  type="button"
                  className="bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-navy-600 text-xs"
                  onClick={() => document.getElementById('model-file-upload').click()}
                >
                  Browse
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="model-price" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Price</label>
              <input id="model-price" name="price" value={form.price} onChange={handleFormChange} type="number" step="0.01" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label htmlFor="model-status" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
              <select id="model-status" name="status" value={form.status} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label htmlFor="model-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Tags (comma separated)</label>
              <input id="model-tags" name="tags" value={form.tags} onChange={handleFormChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Excel File Upload
                <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-2">(For interactive preview)</span>
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.xlsm"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleExcelUpload(e.target.files[0]);
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-navy-600 bg-gray-50 dark:bg-navy-700 text-gray-900 dark:text-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>
                    </div>
                  )}
                </div>
                {form.excel_url && (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-green-700 dark:text-green-300">Excel file uploaded successfully</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowExcelPreview(!showExcelPreview);
                        // If showing preview, scroll to it after a brief delay for render
                        if (!showExcelPreview) {
                          setTimeout(() => {
                            const element = document.getElementById('excel-preview-container');
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 100);
                        }
                      }}
                      className={`text-sm px-3 py-1 rounded border font-medium transition-colors ${
                        showExcelPreview 
                          ? 'bg-gray-600 text-white border-gray-600 hover:bg-gray-700' // Hide Preview - gray like close buttons
                          : 'bg-navy-700 text-white border-navy-700 hover:bg-navy-800' // Show Preview - dark navy like Darkmode button
                      }`}
                    >
                      {showExcelPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                  </div>
                )}
                {form.excel_url && newlyUploadedFile && (
                  <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-green-700 dark:text-green-300">Excel file uploaded successfully</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {error && <div className="text-red-600 dark:text-red-400">{error}</div>}
          <div className="flex gap-2 pt-4">
            <button type="submit" className="bg-teal-600 dark:bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-700 dark:hover:bg-teal-600" disabled={saving}>
              {saving ? 'Saving...' : (editModel ? 'Update' : 'Create')}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingModelId(null); }} className="bg-gray-200 dark:bg-navy-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-navy-600">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// Add a reusable ExportButton component
function ExportButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 bg-teal-600 dark:bg-teal-500 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-teal-700 dark:hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition"
      aria-label={label}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
      </svg>
      {label}
    </button>
  );
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  // Initialize dark mode
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  // Simple authentication (you can enhance this later)
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'zencap2024') { // Change this to a secure password
      setIsAuthenticated(true);
      localStorage.setItem('admin-authenticated', 'true');
    } else {
      alert('Incorrect password');
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem('admin-authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics();
    }
  }, [isAuthenticated]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      setAnalytics(data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin-authenticated');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 flex items-center justify-center">
        <Head>
          <title>Admin Login - ZenCap Analytics</title>
        </Head>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 dark:bg-navy-800/20 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 dark:border-navy-600/30"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">ZenCap Analytics</h1>
            <p className="text-gray-300 dark:text-gray-400">Enter your admin password</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin Password"
                className="w-full px-4 py-3 bg-white/10 dark:bg-navy-700/50 border border-white/20 dark:border-navy-600/50 rounded-lg text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-500 dark:to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-700 hover:to-teal-800 dark:hover:from-teal-600 dark:hover:to-teal-700 transition-all duration-200"
            >
              Access Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 dark:border-teal-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Failed to load analytics</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 bg-teal-600 dark:bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Process data for charts
  const leadsBySource = analytics.leads.latest.reduce((acc, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {});

  const leadsByInterest = analytics.leads.latest.reduce((acc, lead) => {
    acc[lead.interest] = (acc[lead.interest] || 0) + 1;
    return acc;
  }, {});

  const leadsByDate = analytics.leads.latest.reduce((acc, lead) => {
    const date = new Date(lead.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(leadsByDate).map(([date, count]) => ({
    date,
    leads: count
  }));

  const pieData = Object.entries(leadsBySource).map(([source, count]) => ({
    name: source,
    value: count
  }));

  const interestData = Object.entries(leadsByInterest).map(([interest, count]) => ({
    name: interest,
    value: count
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Head>
        <title>Analytics Dashboard - ZenCap</title>
      </Head>

      {/* Header */}
      <div className="bg-white dark:bg-navy-800 shadow-sm border-b border-gray-200 dark:border-navy-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ZenCap Analytics Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Real-time insights and performance metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-200 ${
                  darkMode 
                    ? 'bg-white text-navy-800 hover:bg-gray-100'
                    : 'bg-navy-700 text-white hover:bg-navy-800'
                }`}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-navy-800 border-b border-gray-200 dark:border-navy-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['overview', 'models', 'insights', 'leads', 'newsletter'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 rounded-t-md font-medium text-sm capitalize transition-colors duration-150
                  ${activeTab === tab
                    ? 'bg-teal-600 dark:bg-teal-500 text-white shadow-md'
                    : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-navy-700 hover:text-teal-700 dark:hover:text-teal-300'}
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
              {/* Leads */}
              <div className="bg-white dark:bg-navy-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-navy-700 flex items-center min-w-0">
                <div className="flex-shrink-0 p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm md:text-base font-medium text-gray-600 dark:text-gray-400">Total Leads</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{analytics.leads.total}</p>
                </div>
              </div>
              {/* Newsletter */}
              <div className="bg-white dark:bg-navy-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-navy-700 flex items-center min-w-0">
                <div className="flex-shrink-0 p-3 bg-navy-100 dark:bg-navy-700/50 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-navy-600 dark:text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm md:text-base font-medium text-gray-600 dark:text-gray-400">Newsletter Subscribers</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{analytics.newsletter.subscribers}</p>
                </div>
              </div>
              {/* Models */}
              <div className="bg-white dark:bg-navy-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-navy-700 flex items-center min-w-0">
                <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  {/* Bar chart with line graph overlay icon */}
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    {/* Bars */}
                    <rect x="7" y="28" width="6" height="13" rx="2" stroke="currentColor" className="text-blue-600 dark:text-blue-400" fill="none"/>
                    <rect x="17" y="18" width="6" height="23" rx="2" stroke="currentColor" className="text-blue-600 dark:text-blue-400" fill="none"/>
                    <rect x="27" y="22" width="6" height="19" rx="2" stroke="currentColor" className="text-blue-600 dark:text-blue-400" fill="none"/>
                    <rect x="37" y="12" width="6" height="29" rx="2" stroke="currentColor" className="text-blue-600 dark:text-blue-400" fill="none"/>
                    {/* Line graph overlay - top two points lowered */}
                    <polyline points="10,12 20,6 30,14 40,4" stroke="currentColor" className="text-blue-600 dark:text-blue-400" fill="none"/>
                    {/* Data points - top two points lowered */}
                    <circle cx="10" cy="12" r="2.2" fill="currentColor" className="text-blue-600 dark:text-blue-400"/>
                    <circle cx="20" cy="6" r="2.2" fill="currentColor" className="text-blue-600 dark:text-blue-400"/>
                    <circle cx="30" cy="14" r="2.2" fill="currentColor" className="text-blue-600 dark:text-blue-400"/>
                    <circle cx="40" cy="4" r="2.2" fill="currentColor" className="text-blue-600 dark:text-blue-400"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm md:text-base font-medium text-gray-600 dark:text-gray-400">Total Models</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{analytics.models?.total ?? 0}</p>
                </div>
              </div>
              {/* Insights (now navy) */}
              <div className="bg-white dark:bg-navy-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-navy-700 flex items-center min-w-0">
                <div className="flex-shrink-0 p-3 bg-navy-100 dark:bg-navy-700/30 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-navy-700 dark:text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2 2 2h4a2 2 0 012 2v12a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm md:text-base font-medium text-gray-600 dark:text-gray-400">Total Insights</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">{analytics.insights?.total ?? 0}</p>
                </div>
              </div>
              {/* Conversion Rate */}
              <div className="bg-white dark:bg-navy-800 rounded-lg shadow p-4 sm:p-6 border border-gray-200 dark:border-navy-700 flex items-center min-w-0">
                <div className="flex-shrink-0 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-teal-700 dark:text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm md:text-base font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                    {analytics.leads.total > 0 ? Math.round((analytics.newsletter.subscribers / analytics.leads.total) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-navy-800 rounded-lg shadow p-6 border border-gray-200 dark:border-navy-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Leads Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                    <XAxis dataKey="date" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                    <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                        border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                        borderRadius: "8px",
                        color: darkMode ? "#f9fafb" : "#111827"
                      }}
                    />
                    <Line type="monotone" dataKey="leads" stroke="#046B4E" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-navy-800 rounded-lg shadow p-6 border border-gray-200 dark:border-navy-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Leads by Source</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                        border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                        borderRadius: "8px",
                        color: darkMode ? "#f9fafb" : "#111827"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'leads' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-end mb-2">
              <ExportButton
                onClick={() => {
                  const csv = [
                    ['Name', 'Email', 'Company', 'Interest', 'Message', 'Source', 'Date', 'Status'],
                    ...analytics.leads.latest.map(lead => [
                      lead.name,
                      lead.email,
                      lead.company,
                      lead.interest,
                      lead.message,
                      lead.source,
                      new Date(lead.created_at).toLocaleDateString(),
                      lead.status
                    ])
                  ].map(row => row.join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `zencap-leads-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                }}
                label="Export Leads"
              />
            </div>
            <div className="bg-white dark:bg-navy-800 rounded-lg shadow border border-gray-200 dark:border-navy-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-navy-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Leads</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-navy-700">
                  <thead className="bg-gray-50 dark:bg-navy-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interest</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-navy-800 divide-y divide-gray-200 dark:divide-navy-700">
                    {analytics.leads.latest.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-navy-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{lead.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.company}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{lead.interest}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{lead.source}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            lead.status === 'new' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200' :
                            lead.status === 'contacted' ? 'bg-navy-100 dark:bg-navy-700/50 text-navy-800 dark:text-navy-200' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-end mb-2">
              <ExportButton
                onClick={async () => {
                  const res = await fetch('/api/insights');
                  const data = await res.json();
                  const csv = [
                    ['Title', 'Slug', 'Summary', 'Author', 'Status', 'Published At'],
                    ...(Array.isArray(data) ? data : []).map(insight => [
                      insight.title,
                      insight.slug,
                      insight.summary,
                      insight.author,
                      insight.status,
                      new Date(insight.published_at).toLocaleDateString()
                    ])
                  ].map(row => row.join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `zencap-insights-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                }}
                label="Export Insights"
              />
            </div>
            <div className="bg-white dark:bg-navy-800 rounded-lg shadow p-6 border border-gray-200 dark:border-navy-700 mb-8">
              <InsightsAdmin />
            </div>
          </motion.div>
        )}
        {activeTab === 'newsletter' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-end mb-2">
              <ExportButton
                onClick={async () => {
                  const res = await fetch('/api/newsletter');
                  const data = await res.json();
                  const csv = [
                    ['Email', 'IP Address', 'Created At', 'Status'],
                    ...(data.subscribers || []).map(sub => [
                      sub.email,
                      sub.ip_address,
                      new Date(sub.created_at).toLocaleDateString(),
                      sub.status
                    ])
                  ].map(row => row.join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `zencap-newsletter-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                }}
                label="Export Subscribers"
              />
            </div>
            <div className="bg-white dark:bg-navy-800 rounded-lg shadow p-6 border border-gray-200 dark:border-navy-700 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Newsletter Subscribers</h3>
              {/* Newsletter Subscribers Table */}
              <NewsletterSubscribersTable />
            </div>
          </motion.div>
        )}
        {activeTab === 'models' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-end mb-2">
              <ExportButton
                onClick={async () => {
                  const res = await fetch('/api/models');
                  const data = await res.json();
                  const csv = [
                    ['Title', 'Slug', 'Description', 'Category', 'Price', 'Status', 'Published At'],
                    ...(Array.isArray(data) ? data : []).map(model => [
                      model.title,
                      model.slug,
                      model.description,
                      model.category,
                      model.price,
                      model.status,
                      new Date(model.published_at).toLocaleDateString()
                    ])
                  ].map(row => row.join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `zencap-models-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                }}
                label="Export Models"
              />
            </div>
            <div className="bg-white dark:bg-navy-800 rounded-lg shadow p-6 border border-gray-200 dark:border-navy-700 mb-8">
              <ModelsAdmin />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 

// Add NewsletterSubscribersTable component at the bottom of the file
function NewsletterSubscribersTable() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // id of row being acted on

  const fetchSubscribers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/newsletter');
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers);
      } else {
        setError('Failed to load subscribers');
      }
    } catch (err) {
      setError('Failed to load subscribers');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleUnsubscribe = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'unsubscribed' })
      });
      await fetchSubscribers();
    } catch (err) {
      alert('Failed to unsubscribe');
    }
    setActionLoading(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subscriber?')) return;
    setActionLoading(id);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      await fetchSubscribers();
    } catch (err) {
      alert('Failed to delete');
    }
    setActionLoading(null);
  };

  if (loading) return <div className="text-gray-500 dark:text-gray-400">Loading...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;
  if (!subscribers.length) return <div className="text-gray-500 dark:text-gray-400">No subscribers found.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-navy-700">
        <thead className="bg-gray-50 dark:bg-navy-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Subscribed</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-navy-800 divide-y divide-gray-200 dark:divide-navy-700">
          {subscribers.map(sub => (
            <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-navy-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{sub.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sub.ip_address || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(sub.created_at).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  sub.status === 'unsubscribed'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    : 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200'
                }`}>
                  {sub.status || 'active'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap flex justify-end gap-2">
                <button
                  onClick={() => handleUnsubscribe(sub.id)}
                  className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white px-4 py-2 rounded disabled:opacity-50 transition"
                  disabled={actionLoading === sub.id || sub.status === 'unsubscribed'}
                >
                  Unsubscribe
                </button>
                <button
                  onClick={() => handleDelete(sub.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50 transition"
                  disabled={actionLoading === sub.id}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 