import api from "@/utils/api";
import { format } from "date-fns";

export async function generateReportData(filters) {
  try {
    // 1. Fetch ALL data
    const res = await api.get('/transactions/all-history');
    const allTransactions = res.data;

    // 2. Prepare Filters
    const startDate = filters.startDate ? new Date(filters.startDate) : new Date('2020-01-01');
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
    endDate.setHours(23, 59, 59, 999);

    // 3. Filter Logic
    const filterCommon = (tx) => {
      // Date Check
      const txDate = new Date(tx.createdAt);
      const dateMatch = txDate >= startDate && txDate <= endDate;

      // Category Check
      // If filter is empty OR 'all', allow everything. Otherwise, match exact category.
      const categoryMatch = (!filters.category || filters.category === "all")
        ? true
        : (tx.equipment?.category === filters.category);

      // Borrower Name Search
      const borrowerMatch = filters.borrower
        ? (tx.user?.username?.toLowerCase().includes(filters.borrower.toLowerCase()))
        : true;

      return dateMatch && categoryMatch && borrowerMatch;
    };

    // 4. Return Data based on Type
    switch (filters.reportType) {
      case 'lending':
        return allTransactions
          .filter(tx => filterCommon(tx))
          // We include Pending/Borrowed/Checked Out/Returned/Overdue
          .filter(tx => ['Borrowed', 'Checked Out', 'Returned', 'Overdue', 'Pending'].includes(tx.status))
          .map(tx => ({
            id: tx._id,
            equipmentName: tx.equipment?.name || "Unknown Device",
            serialNumber: tx.equipment?.serialNumber || "N/A",
            category: tx.equipment?.category || "General",
            borrowerName: tx.user?.username || "Unknown User",
            lendingDate: format(new Date(tx.createdAt), 'yyyy-MM-dd'),
            dueDate: format(new Date(tx.expectedReturnTime), 'yyyy-MM-dd'),
            status: tx.status
          }));

      case 'reservation':
        return allTransactions
          .filter(tx => filterCommon(tx))
          .filter(tx => tx.status === 'Reserved')
          .map(tx => ({
            id: tx._id,
            equipmentName: tx.equipment?.name || "Unknown",
            serialNumber: tx.equipment?.serialNumber || "N/A",
            category: tx.equipment?.category || "General",
            borrowerName: tx.user?.username || "Unknown",
            reservationStart: format(new Date(tx.startTime), 'yyyy-MM-dd HH:mm'),
            reservationEnd: format(new Date(tx.expectedReturnTime), 'yyyy-MM-dd HH:mm'),
            status: 'RESERVED'
          }));

      case 'utilization':
        const utilizationMap = {};
        allTransactions.forEach(tx => {
          if (!tx.equipment) return;
          const eqId = tx.equipment._id;

          if (!utilizationMap[eqId]) {
            utilizationMap[eqId] = {
              id: `UTIL-${eqId}`,
              equipmentName: tx.equipment.name,
              serialNumber: tx.equipment.serialNumber,
              category: tx.equipment.category || "General",
              totalCheckouts: 0,
              currentStatus: tx.equipment.status || 'Unknown'
            };
          }
          utilizationMap[eqId].totalCheckouts += 1;
        });

        let utilData = Object.values(utilizationMap);
        if (filters.category && filters.category !== "all") {
          utilData = utilData.filter(item => item.category === filters.category);
        }

        return utilData.map(item => ({
          ...item,
          utilizationRate: Math.min(100, item.totalCheckouts * 5)
        }));

      default:
        return [];
    }
  } catch (error) {
    console.error("Failed to generate report:", error);
    return [];
  }
}

// Keep export functions
export function exportToCSV(data, columns, getRowData, filename) {
  if (!data || data.length === 0) { alert('No data to export'); return; }
  const header = columns.join(',');
  const rows = data.map(item => {
    const rowData = getRowData(item);
    const textData = rowData.map(cell => String(cell || '').replace(/,/g, ';'));
    return textData.join(',');
  });
  const csvContent = [header, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(data, columns, getRowData, reportType, startDate, endDate, filename) {
  if (!data || data.length === 0) { alert('No data to export'); return; }
  const printWindow = window.open('', '_blank');
  const tableRows = data.map(item => {
    const rowData = getRowData(item);
    const textData = rowData.map(cell => String(cell || ''));
    return `<tr>${textData.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
  }).join('');
  const htmlContent = `<!DOCTYPE html><html><head><title>${reportType}</title><style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#f8fafc;color:black;padding:10px;border:1px solid #ddd}td{padding:8px;border:1px solid #ddd;text-align:center}tr:nth-child(even){background:#f2f2f2}h1{color:black}</style></head><body><h1>${reportType}</h1><p>Generated: ${new Date().toLocaleString()}</p><table><thead><tr>${columns.map(col => `<th>${col}</th>`).join('')}</tr></thead><tbody>${tableRows}</tbody></table><script>window.onload=function(){window.print();}</script></body></html>`;
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}