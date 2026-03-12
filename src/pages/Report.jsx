import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Download, Printer } from 'lucide-react';
import './Report.css';

const Report = () => {
  const [reportType, setReportType] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Fetch report data when report type changes
  useEffect(() => {
    if (reportType !== 'custom') {
      fetchReport(reportType);
    }
  }, [reportType]);

  const fetchReport = async (type, startDate = null, endDate = null) => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `http://localhost:5000/api/reports/${type}`;
      
      if (type === 'custom' && startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setReportData(data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch report');
        setReportData(null);
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to connect to server');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomReport = () => {
    if (!customStartDate || !customEndDate) {
      setError('Please select both start and end dates');
      return;
    }
    
    if (new Date(customStartDate) > new Date(customEndDate)) {
      setError('Start date must be before end date');
      return;
    }

    setReportType('custom');
    fetchReport('custom', customStartDate, customEndDate);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!reportData) return;

    const csvContent = generateCSV(reportData);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateCSV = (data) => {
    let csv = 'New Student Registration Report\n';
    csv += `Period: ${data.period}\n`;
    csv += `Date Range: ${data.startDate || data.date} to ${data.endDate || data.date}\n`;
    csv += `Total Registrations: ${data.totalCount}\n\n`;
    
    csv += 'Registration Number,Student Name,NIC,Faculty,Center,Contact Number,Registration Date\n';
    
    data.students.forEach(student => {
      const regDate = new Date(student.createdAt).toLocaleString();
      csv += `${student.Registration_Number || 'N/A'},"${student.Username}","${student.NIC}","${student.Faculty}","${student.Center}","${student.Contact_Number}","${regDate}"\n`;
    });

    return csv;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('default', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="report-container">
      {/* Header */}
      <div className="report-header">
        <div className="report-title-section">
          <BarChart3 size={32} className="report-icon" />
          <div>
            <h1>Student Registration Reports</h1>
            <p>View daily, weekly, and monthly new student registrations</p>
          </div>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="report-controls">
        <div className="report-tabs">
          <button
            className={`tab ${reportType === 'daily' ? 'active' : ''}`}
            onClick={() => setReportType('daily')}
          >
            Daily
          </button>
          <button
            className={`tab ${reportType === 'weekly' ? 'active' : ''}`}
            onClick={() => setReportType('weekly')}
          >
            Weekly
          </button>
          <button
            className={`tab ${reportType === 'monthly' ? 'active' : ''}`}
            onClick={() => setReportType('monthly')}
          >
            Monthly
          </button>
          <button
            className={`tab ${reportType === 'custom' ? 'active' : ''}`}
            onClick={() => setReportType('custom')}
          >
            Custom
          </button>
        </div>

        {/* Custom Date Range Picker */}
        {reportType === 'custom' && (
          <div className="custom-date-range">
            <div className="date-input-group">
              <label>Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="date-input"
              />
            </div>
            <div className="date-input-group">
              <label>End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="date-input"
              />
            </div>
            <button onClick={handleCustomReport} className="btn-generate">
              Generate Report
            </button>
          </div>
        )}

        {/* Action Buttons */}
        {reportData && (
          <div className="report-actions">
            <button onClick={handlePrint} className="btn-action btn-print">
              <Printer size={18} />
              Print
            </button>
            <button onClick={handleDownload} className="btn-action btn-download">
              <Download size={18} />
              Download CSV
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading report...</p>
        </div>
      )}

      {/* Report Summary */}
      {reportData && !loading && (
        <div className="no-print">
          <div className="report-summary">
            <div className="summary-card">
              <div className="summary-label">Total New Registrations</div>
              <div className="summary-value">{reportData.totalCount}</div>
              <div className="summary-period">
                {reportData.period === 'Monthly' && reportData.month}
                {reportData.period === 'Weekly' && `${reportData.startDate} to ${reportData.endDate}`}
                {reportData.period === 'Daily' && reportData.date}
                {reportData.period === 'Custom' && `${reportData.startDate} to ${reportData.endDate}`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Table */}
      {reportData && !loading && (
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Reg. Number</th>
                <th>Student Name</th>
                <th>NIC</th>
                <th>Faculty</th>
                <th>Center</th>
                <th>Contact Number</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {reportData.students.length > 0 ? (
                reportData.students.map((student, index) => (
                  <tr key={student.UID || index}>
                    <td>{student.Registration_Number || 'N/A'}</td>
                    <td>{student.Username}</td>
                    <td>{student.NIC}</td>
                    <td>{student.Faculty}</td>
                    <td>{student.Center}</td>
                    <td>{student.Contact_Number}</td>
                    <td>{formatDate(student.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No new registrations found for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!reportData && !loading && (
        <div className="empty-state">
          <Calendar size={48} />
          <h2>Select a report type</h2>
          <p>Choose daily, weekly, monthly, or custom date range to view student registration reports</p>
        </div>
      )}
    </div>
  );
};

export default Report;
