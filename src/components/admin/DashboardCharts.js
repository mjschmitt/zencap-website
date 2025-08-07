// src/components/admin/DashboardCharts.js - Optimized chart components
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#046B4E', '#3e6792', '#6187ad', '#8ba8c2', '#bccddc'];

// Mock data for charts
const visitorData = [
  { name: 'Jan', visitors: 400, pageViews: 800 },
  { name: 'Feb', visitors: 300, pageViews: 600 },
  { name: 'Mar', visitors: 600, pageViews: 1200 },
  { name: 'Apr', visitors: 800, pageViews: 1600 },
  { name: 'May', visitors: 500, pageViews: 1000 },
];

const modelData = [
  { name: 'Private Equity', count: 8, revenue: 25000 },
  { name: 'Public Equity', count: 4, revenue: 15000 },
];

const statusData = [
  { name: 'Published', value: 8, color: COLORS[0] },
  { name: 'Draft', value: 4, color: COLORS[1] },
];

const DashboardCharts = ({ className = "" }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ${className}`}>
      {/* Visitor Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitor Trends</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={visitorData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="visitors" stroke={COLORS[0]} strokeWidth={2} />
            <Line type="monotone" dataKey="pageViews" stroke={COLORS[1]} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Model Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Sales</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={modelData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill={COLORS[0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Content Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Status</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              outerRadius={60}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;