// Mock data generator for reports
// In production, this would call actual API endpoints

import { getAllDeviceMovements } from '@/components/lib/movementHistoryData';

const mockEquipment = [
  { id: 'EQ-001', name: 'MacBook Pro 16"', serialNumber: 'SN-MBP-001', category: 'Laptop' },
  { id: 'EQ-002', name: 'Dell XPS 15', serialNumber: 'SN-DELL-002', category: 'Laptop' },
  { id: 'EQ-003', name: 'iPad Pro 12.9"', serialNumber: 'SN-IPAD-003', category: 'Tablet' },
  { id: 'EQ-004', name: 'Sony A7 III Camera', serialNumber: 'SN-SONY-004', category: 'Camera' },
  { id: 'EQ-005', name: 'Canon EOS R6', serialNumber: 'SN-CANON-005', category: 'Camera' },
  { id: 'EQ-006', name: 'Shure SM7B Microphone', serialNumber: 'SN-SHURE-006', category: 'Audio' },
  { id: 'EQ-007', name: 'Rode Wireless GO II', serialNumber: 'SN-RODE-007', category: 'Audio' },
  { id: 'EQ-008', name: 'Epson PowerLite Projector', serialNumber: 'SN-EPSON-008', category: 'Projector' },
];

const mockBorrowers = [
  'John Doe',
  'Jane Smith',
  'Alice Johnson',
  'Bob Williams',
  'Carol Brown',
  'David Miller',
  'Emma Davis',
];

// Generate mock lending report data
function generateLendingReport(filters) {
  const data = [];
  const startDate = new Date(filters.startDate);
  const endDate = new Date(filters.endDate);
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < Math.min(25, daysDiff * 2); i++) {
    const equipment = mockEquipment[Math.floor(Math.random() * mockEquipment.length)];
    const borrower = mockBorrowers[Math.floor(Math.random() * mockBorrowers.length)];
    const lendingDate = new Date(startDate);
    lendingDate.setDate(startDate.getDate() + Math.floor(Math.random() * daysDiff));
    const dueDate = new Date(lendingDate);
    dueDate.setDate(lendingDate.getDate() + 14);
    
    if (filters.category && filters.category !== equipment.category) continue;
    if (filters.borrower && !borrower.toLowerCase().includes(filters.borrower.toLowerCase())) continue;
    
    data.push({
      id: `LEND-${i + 1}`,
      equipmentName: equipment.name,
      serialNumber: equipment.serialNumber,
      category: equipment.category,
      borrowerName: borrower,
      lendingDate: lendingDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: filters.status && filters.status !== 'all' ? filters.status : 'LENT',
    });
  }
  
  return data;
}

// Generate mock reservation report data
function generateReservationReport(filters) {
  const data = [];
  const startDate = new Date(filters.startDate);
  const endDate = new Date(filters.endDate);
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < Math.min(20, daysDiff); i++) {
    const equipment = mockEquipment[Math.floor(Math.random() * mockEquipment.length)];
    const borrower = mockBorrowers[Math.floor(Math.random() * mockBorrowers.length)];
    const reservationStart = new Date(startDate);
    reservationStart.setDate(startDate.getDate() + Math.floor(Math.random() * daysDiff));
    const reservationEnd = new Date(reservationStart);
    reservationEnd.setDate(reservationStart.getDate() + 7);
    
    if (filters.category && filters.category !== equipment.category) continue;
    if (filters.borrower && !borrower.toLowerCase().includes(filters.borrower.toLowerCase())) continue;
    
    data.push({
      id: `RES-${i + 1}`,
      equipmentName: equipment.name,
      serialNumber: equipment.serialNumber,
      category: equipment.category,
      borrowerName: borrower,
      reservationStart: reservationStart.toISOString().split('T')[0],
      reservationEnd: reservationEnd.toISOString().split('T')[0],
      status: 'RESERVED',
    });
  }
  
  return data;
}

// Generate mock damaged equipment report data
function generateDamagedReport(filters) {
  const data = [];
  const startDate = new Date(filters.startDate);
  const endDate = new Date(filters.endDate);
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  const conditions = ['Minor Damage', 'Major Damage', 'Screen Crack', 'Battery Issue'];
  const remarks = [
    'Screen has minor scratches',
    'Battery needs replacement',
    'Keyboard not functioning properly',
    'Camera lens cracked',
    'Charging port damaged',
  ];
  
  for (let i = 0; i < Math.min(15, daysDiff); i++) {
    const equipment = mockEquipment[Math.floor(Math.random() * mockEquipment.length)];
    const damageDate = new Date(startDate);
    damageDate.setDate(startDate.getDate() + Math.floor(Math.random() * daysDiff));
    
    if (filters.category && filters.category !== equipment.category) continue;
    
    data.push({
      id: `DAM-${i + 1}`,
      equipmentName: equipment.name,
      serialNumber: equipment.serialNumber,
      category: equipment.category,
      damageDate: damageDate.toISOString().split('T')[0],
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      remarks: remarks[Math.floor(Math.random() * remarks.length)],
      status: 'DAMAGED',
    });
  }
  
  return data;
}

// Generate mock lost equipment report data
function generateLostReport(filters) {
  const data = [];
  const startDate = new Date(filters.startDate);
  const endDate = new Date(filters.endDate);
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  const locations = [
    'Building A, Room 101',
    'Building B, Media Lab',
    'Building C, Equipment Room',
    'Building D, Design Lab',
  ];
  const remarks = [
    'Last seen during checkout',
    'Missing from inventory',
    'Not returned after due date',
    'Lost during transport',
  ];
  
  for (let i = 0; i < Math.min(10, daysDiff); i++) {
    const equipment = mockEquipment[Math.floor(Math.random() * mockEquipment.length)];
    const lossDate = new Date(startDate);
    lossDate.setDate(startDate.getDate() + Math.floor(Math.random() * daysDiff));
    
    if (filters.category && filters.category !== equipment.category) continue;
    
    data.push({
      id: `LOST-${i + 1}`,
      equipmentName: equipment.name,
      serialNumber: equipment.serialNumber,
      category: equipment.category,
      lossDate: lossDate.toISOString().split('T')[0],
      lastKnownLocation: locations[Math.floor(Math.random() * locations.length)],
      remarks: remarks[Math.floor(Math.random() * remarks.length)],
      status: 'LOST',
    });
  }
  
  return data;
}

// Generate mock utilization report data
function generateUtilizationReport(filters) {
  const data = [];
  
  for (let i = 0; i < mockEquipment.length; i++) {
    const equipment = mockEquipment[i];
    
    if (filters.category && filters.category !== equipment.category) continue;
    
    const totalCheckouts = Math.floor(Math.random() * 50) + 5;
    const utilizationRate = Math.floor(Math.random() * 80) + 10;
    const statuses = ['AVAILABLE', 'LENT', 'RESERVED'];
    const currentStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    if (filters.status && filters.status !== 'all' && filters.status !== currentStatus) continue;
    
    data.push({
      id: `UTIL-${i + 1}`,
      equipmentName: equipment.name,
      serialNumber: equipment.serialNumber,
      category: equipment.category,
      totalCheckouts,
      utilizationRate,
      currentStatus,
    });
  }
  
  return data;
}

// Generate logs report data from device movements
function generateLogsReport(filters) {
  // Adjust endDate to include the full day (end of day)
  // Convert "YYYY-MM-DD" to "YYYY-MM-DDTHH:mm:ss" format for end of day
  let adjustedEndDate = filters.endDate;
  if (adjustedEndDate && !adjustedEndDate.includes('T')) {
    adjustedEndDate = adjustedEndDate + 'T23:59:59';
  }

  // Get all device movements with filters
  const movements = getAllDeviceMovements({
    deviceId: filters.deviceId && filters.deviceId !== '' ? filters.deviceId : undefined,
    eventType: filters.eventType && filters.eventType !== 'all' ? filters.eventType : undefined,
    startDate: filters.startDate,
    endDate: adjustedEndDate,
    status: filters.status && filters.status !== 'all' ? filters.status : undefined,
  });

  // Format movements for report
  return movements.map((movement, index) => {
    const date = new Date(movement.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Format event type for display
    const eventTypeLabels = {
      checkout: 'Checkout',
      return: 'Return',
      movement: 'Movement',
      geofence_violation: 'Geofence Violation',
    };

    return {
      id: movement.id || `LOG-${index + 1}`,
      deviceName: movement.deviceName || 'Unknown Device',
      deviceId: movement.deviceId || 'N/A',
      eventType: eventTypeLabels[movement.eventType] || movement.eventType,
      location: movement.location || 'Unknown Location',
      userName: movement.userName || 'Unknown User',
      timestamp: `${formattedDate} ${formattedTime}`,
      status: movement.status || 'unknown',
      action: movement.action || 'N/A',
      coordinates: movement.coordinates 
        ? `${movement.coordinates.lat.toFixed(4)}, ${movement.coordinates.lng.toFixed(4)}`
        : 'N/A',
    };
  });
}

// Main function to generate report data
export function generateReportData(filters) {
  switch (filters.reportType) {
    case 'lending':
      return generateLendingReport(filters);
    case 'reservation':
      return generateReservationReport(filters);
    case 'damaged':
      return generateDamagedReport(filters);
    case 'lost':
      return generateLostReport(filters);
    case 'utilization':
      return generateUtilizationReport(filters);
    case 'logs':
      return generateLogsReport(filters);
    default:
      return [];
  }
}

// Export to CSV
export function exportToCSV(data, columns, getRowData, filename) {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create CSV header
  const header = columns.join(',');
  
  // Create CSV rows
  const rows = data.map(item => {
    const rowData = getRowData(item);
    // Extract text content from React elements (like Badge)
    const textData = rowData.map(cell => {
      if (typeof cell === 'object' && cell !== null && cell.props) {
        // If it's a React element, try to get text content
        return cell.props.children || '';
      }
      return String(cell || '').replace(/,/g, ';'); // Replace commas to avoid CSV issues
    });
    return textData.join(',');
  });
  
  // Combine header and rows
  const csvContent = [header, ...rows].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export to PDF
export async function exportToPDF(data, columns, getRowData, reportType, startDate, endDate, filename) {
  // For PDF export, we'll use a simple approach with window.print() or jsPDF
  // Since jsPDF might not be installed, we'll create a printable HTML page
  
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create a printable HTML table
  const printWindow = window.open('', '_blank');
  const tableRows = data.map(item => {
    const rowData = getRowData(item);
    const textData = rowData.map(cell => {
      if (typeof cell === 'object' && cell !== null && cell.props) {
        return cell.props.children || '';
      }
      return String(cell || '');
    });
    return `<tr>${textData.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${reportType}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        h1 {
          color: #333;
          margin-bottom: 10px;
        }
        .report-info {
          margin-bottom: 20px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #BEBEE0;
          color: white;
          padding: 10px;
          text-align: center;
          border: 1px solid #ddd;
        }
        td {
          padding: 8px;
          text-align: center;
          border: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        @media print {
          body { margin: 0; }
          @page { margin: 1cm; }
        }
      </style>
    </head>
    <body>
      <h1>${reportType}</h1>
      <div class="report-info">
        <p><strong>Date Range:</strong> ${startDate} to ${endDate}</p>
        <p><strong>Total Records:</strong> ${data.length}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Alternative: If you want to use jsPDF library, you would need to install it
  // For now, this HTML approach allows users to save as PDF from the print dialog
}

