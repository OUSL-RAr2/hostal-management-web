import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Download, Printer, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './Report.css';

const Report = () => {
  const [reportType, setReportType] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [checkInOutData, setCheckInOutData] = useState(null);
  const [checkInOutRange, setCheckInOutRange] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Fetch report data when report type or check-in/out range changes
  useEffect(() => {
    if (reportType === 'custom') {
      return; // wait for explicit generation
    }

    if (reportType === 'checkin') {
      fetchCheckInOutReport(checkInOutRange);
    } else {
      fetchReport(reportType);
    }
  }, [reportType, checkInOutRange]);

  const computeRange = (type, startDate, endDate) => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    if (type === 'daily') {
      return {
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
    }

    if (type === 'weekly') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 6); // 7-day window
      return {
        startDate: weekAgo.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
    }

    if (type === 'monthly') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        startDate: firstDay.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
    }

    if (type === 'custom') {
      return {
        startDate: startDate || today.toISOString().split('T')[0],
        endDate: endDate || today.toISOString().split('T')[0]
      };
    }

    return { startDate: null, endDate: null };
  };

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

  const fetchCheckInOutReport = async (rangeType, startDate = null, endDate = null) => {
    try {
      setLoading(true);
      setError(null);

      const range = computeRange(rangeType, startDate, endDate);
      const params = `startDate=${range.startDate}&endDate=${range.endDate}`;
      const url = `http://localhost:5000/api/qr/statistics?${params}`;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCheckInOutData({
          period: 'Check-In/Out',
          rangeType,
          startDate: range.startDate,
          endDate: range.endDate,
          ...data.data
        });
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch check-in/out report');
        setCheckInOutData(null);
      }
    } catch (err) {
      console.error('Error fetching check-in/out report:', err);
      setError('Failed to connect to server');
      setCheckInOutData(null);
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

    if (reportType === 'checkin') {
      fetchCheckInOutReport('custom', customStartDate, customEndDate);
    } else {
      setReportType('custom');
      fetchReport('custom', customStartDate, customEndDate);
    }
  };

  const generatePrintHtml = (data, isCheckin = false) => {
    const dateRange = data.startDate && data.endDate
      ? `${data.startDate} to ${data.endDate}`
      : data.date || 'N/A';

    if (isCheckin) {
      const locationRows = Object.entries(data.byLocation || {}).map(([location, stats]) => `
        <tr>
          <td>${location}</td>
          <td>${stats.check_in}</td>
          <td>${stats.check_out}</td>
        </tr>
      `).join('');

      const dailyRows = (data.byDate || []).map(day => `
        <tr>
          <td>${day.date}</td>
          <td>${day.checkIns}</td>
          <td>${day.checkOuts}</td>
        </tr>
      `).join('');

      return `
      <html>
        <head>
          <title>Check-In/Out Report</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; margin: 24px; }
            h1 { margin-bottom: 8px; font-size: 1.5rem; }
            p { margin: 2px 0 8px; }
            table { border-collapse: collapse; width: 100%; font-size: 12px; margin-bottom: 16px; }
            th, td { border: 1px solid #666; padding: 6px 8px; text-align: left; }
            th { background: #333; color: #fff; }
            tr:nth-child(even) { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <header>
            <h1>Check-In/Out Report</h1>
            <p><strong>Range:</strong> ${dateRange}</p>
            <p><strong>Total activities:</strong> ${data.total || 0}</p>
            <p><strong>Check-ins:</strong> ${data.checkIns || 0} | <strong>Check-outs:</strong> ${data.checkOuts || 0}</p>
            <hr />
          </header>

          <h2>By Location</h2>
          <table>
            <thead>
              <tr><th>Location</th><th>Check-ins</th><th>Check-outs</th></tr>
            </thead>
            <tbody>${locationRows || '<tr><td colspan="3" style="text-align:center;">No data</td></tr>'}</tbody>
          </table>

          <h2>By Day</h2>
          <table>
            <thead>
              <tr><th>Date</th><th>Check-ins</th><th>Check-outs</th></tr>
            </thead>
            <tbody>${dailyRows || '<tr><td colspan="3" style="text-align:center;">No data</td></tr>'}</tbody>
          </table>
        </body>
      </html>
      `;
    }

    const rows = (data.students || []).map((student, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${student.Registration_Number || 'N/A'}</td>
        <td>${student.Username || ''}</td>
        <td>${student.NIC || ''}</td>
        <td>${student.Faculty || ''}</td>
        <td>${student.Center || ''}</td>
        <td>${student.Contact_Number || ''}</td>
        <td>${formatDate(student.createdAt)}</td>
      </tr>
    `).join('');

    return `
      <html>
        <head>
          <title>Student Registration Report</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; margin: 24px; }
            h1 { margin-bottom: 8px; font-size: 1.5rem; }
            p { margin: 2px 0 8px; }
            table { border-collapse: collapse; width: 100%; font-size: 12px; }
            th, td { border: 1px solid #666; padding: 6px 8px; text-align: left; }
            th { background: #333; color: #fff; }
            tr:nth-child(even) { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <header>
            <h1>Student Registration Report</h1>
            <p><strong>Report Type:</strong> ${data.period}</p>
            <p><strong>Period:</strong> ${dateRange}</p>
            <p><strong>Total registrations:</strong> ${data.totalCount ?? 0}</p>
            <hr />
          </header>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Reg #</th>
                <th>Name</th>
                <th>NIC</th>
                <th>Faculty</th>
                <th>Center</th>
                <th>Contact</th>
                <th>Reg Date</th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="8" style="text-align:center;">No data</td></tr>'}</tbody>
          </table>
        </body>
      </html>
    `;
  };

  const handleDownloadPDF = () => {
    const data = reportType === 'checkin' ? checkInOutData : reportData;
    if (!data) return;

    const doc = new jsPDF('l', 'pt', 'a4');
    const title = reportType === 'checkin'
      ? `Check-In/Out Report (${data.rangeType || 'daily'})`
      : `Student Registration Report (${data.period})`;
    const dateText = data.startDate && data.endDate
      ? `Range: ${data.startDate} to ${data.endDate}`
      : data.date
        ? `Date: ${data.date}`
        : '';

    doc.setFontSize(16);
    doc.text(title, 40, 40);
    doc.setFontSize(11);
    doc.text(dateText, 40, 62);

    if (reportType === 'checkin') {
      doc.text(`Total activities: ${data.total || 0}`, 40, 78);
      const columns = ['Location', 'Check-ins', 'Check-outs'];
      const rows = Object.entries(data.byLocation || {}).map(([location, stats]) => [
        location,
        stats.check_in,
        stats.check_out
      ]);

      doc.autoTable({
        head: [columns],
        body: rows,
        startY: 95,
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [33, 37, 41], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 40, right: 40 },
      });
    } else {
      doc.text(`Total: ${data.totalCount || 0}`, 40, 78);
      const columns = ['#', 'Reg Number', 'Name', 'NIC', 'Faculty', 'Center', 'Mobile', 'Registered At'];
      const rows = (data.students || []).map((student, index) => [
        index + 1,
        student.Registration_Number || 'N/A',
        student.Username || '',
        student.NIC || '',
        student.Faculty || '',
        student.Center || '',
        student.Contact_Number || '',
        formatDate(student.createdAt),
      ]);

      doc.autoTable({
        head: [columns],
        body: rows,
        startY: 95,
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [33, 37, 41], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 40, right: 40 },
      });
    }

    const filename = `report_${reportType}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  };

  const handlePrint = () => {
    const data = reportType === 'checkin' ? checkInOutData : reportData;
    if (!data) return;

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      alert('Please allow popups for printing.');
      return;
    }

    printWindow.document.write(generatePrintHtml(data, reportType === 'checkin'));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setTimeout(() => printWindow.close(), 300);
  };

  const handleDownload = () => {
    const data = reportType === 'checkin' ? checkInOutData : reportData;
    if (!data) return;

    const csvContent = generateCSV(data, reportType === 'checkin');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateCSV = (data, isCheckin = false) => {
    if (isCheckin) {
      let csv = 'Check-In/Out Report\n';
      csv += `Date Range: ${data.startDate || ''} to ${data.endDate || ''}\n`;
      csv += `Total activities: ${data.total || 0}\n`;
      csv += `Check-ins: ${data.checkIns || 0}, Check-outs: ${data.checkOuts || 0}\n\n`;

      csv += 'Location,Check-ins,Check-outs\n';
      Object.entries(data.byLocation || {}).forEach(([location, stats]) => {
        csv += `${location},${stats.check_in},${stats.check_out}\n`;
      });

      csv += '\nDate,Check-ins,Check-outs\n';
      (data.byDate || []).forEach(item => {
        csv += `${item.date},${item.checkIns},${item.checkOuts}\n`;
      });

      return csv;
    }

    let csv = 'New Student Registration Report\n';
    csv += `Period: ${data.period}\n`;
    csv += `Date Range: ${data.startDate || data.date} to ${data.endDate || data.date}\n`;
    csv += `Total Registrations: ${data.totalCount}\n\n`;

    csv += 'Registration Number,Student Name,NIC,Faculty,Center,Contact Number,Registration Date\n';

    (data.students || []).forEach(student => {
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
          <div>
            <h1>{reportType === 'checkin' ? 'Check-In/Out Usage Reports' : 'Student Registration Reports'}</h1>
            <p>{reportType === 'checkin' ? 'Evaluate daily/weekly check-in and check-out activity' : 'View daily, weekly, and monthly new student registrations'}</p>
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
            Daily Registrations
          </button>
          <button
            className={`tab ${reportType === 'weekly' ? 'active' : ''}`}
            onClick={() => setReportType('weekly')}
          >
            Weekly Registrations
          </button>
          <button
            className={`tab ${reportType === 'monthly' ? 'active' : ''}`}
            onClick={() => setReportType('monthly')}
          >
            Monthly Registrations
          </button>
          <button
            className={`tab ${reportType === 'custom' ? 'active' : ''}`}
            onClick={() => setReportType('custom')}
          >
            Custom Registrations
          </button>
          <button
            className={`tab ${reportType === 'checkin' ? 'active' : ''}`}
            onClick={() => setReportType('checkin')}
          >
            Check-In/Out
          </button>
        </div>

        {reportType === 'checkin' && (
          <div className="report-tabs" style={{ marginTop: '12px' }}>
            <button
              className={`tab ${checkInOutRange === 'daily' ? 'active' : ''}`}
              onClick={() => setCheckInOutRange('daily')}
            >
              Daily
            </button>
            <button
              className={`tab ${checkInOutRange === 'weekly' ? 'active' : ''}`}
              onClick={() => setCheckInOutRange('weekly')}
            >
              Weekly
            </button>
            <button
              className={`tab ${checkInOutRange === 'monthly' ? 'active' : ''}`}
              onClick={() => setCheckInOutRange('monthly')}
            >
              Monthly
            </button>
            <button
              className={`tab ${checkInOutRange === 'custom' ? 'active' : ''}`}
              onClick={() => setCheckInOutRange('custom')}
            >
              Custom
            </button>
          </div>
        )}

        {/* Custom Date Range Picker */}
        {(reportType === 'custom' || (reportType === 'checkin' && checkInOutRange === 'custom')) && (
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
        {(reportData || checkInOutData) && (
          <div className="report-actions">
            <button onClick={handlePrint} className="btn-action btn-print">
              <Printer size={18} />
              Print
            </button>
            <button onClick={handleDownloadPDF} className="btn-action btn-pdf">
              <FileText size={18} />
              Download PDF
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
      {(reportType === 'checkin' ? checkInOutData : reportData) && !loading && (
        <div className="report-summary">
          {reportType === 'checkin' ? (
            <>
              <div className="summary-card">
                <div className="summary-label">Total Activities</div>
                <div className="summary-value">{checkInOutData?.total || 0}</div>
                <div className="summary-period">{checkInOutData?.startDate} to {checkInOutData?.endDate}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Check-ins</div>
                <div className="summary-value">{checkInOutData?.checkIns || 0}</div>
                <div className="summary-period">{checkInOutData?.rangeType || 'daily'}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Check-outs</div>
                <div className="summary-value">{checkInOutData?.checkOuts || 0}</div>
                <div className="summary-period">{checkInOutData?.rangeType || 'daily'}</div>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}

      {/* Report Table */}
      {reportType === 'checkin' && checkInOutData && !loading && (
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Check-ins</th>
                <th>Check-outs</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(checkInOutData.byLocation || {}).length > 0 ? (
                Object.entries(checkInOutData.byLocation).map(([location, stats]) => (
                  <tr key={location}>
                    <td>{location}</td>
                    <td>{stats.check_in}</td>
                    <td>{stats.check_out}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data">No check-in/out location data found for this period</td>
                </tr>
              )}
            </tbody>
          </table>

          <h3>Daily Usage</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check-ins</th>
                <th>Check-outs</th>
              </tr>
            </thead>
            <tbody>
              {checkInOutData.byDate && checkInOutData.byDate.length > 0 ? (
                checkInOutData.byDate.map((item) => (
                  <tr key={item.date}>
                    <td>{item.date}</td>
                    <td>{item.checkIns}</td>
                    <td>{item.checkOuts}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data">No daily usage data found for this period</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {reportType !== 'checkin' && reportData && !loading && (
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
      {!(reportType === 'checkin' ? checkInOutData : reportData) && !loading && (
        <div className="empty-state">
          <Calendar size={48} />
          <h2>Select a report type</h2>
          <p>{reportType === 'checkin'
            ? 'Choose daily, weekly, monthly, or custom date range to view check-in/out usage reports'
            : 'Choose daily, weekly, monthly, or custom date range to view student registration reports'
          }</p>
        </div>
      )}
    </div>
  );
};

export default Report;
