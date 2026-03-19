import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Format date helper
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
};

// Now supports 'customColumns' and 'customRows' for full flexibility
export const generatePDF = (
    reportData,
    currentUser,
    reportTitle = "EQUIPMENT REPORT",
    customColumns = null,
    customRows = null
) => {
    const doc = new jsPDF();

    // --- 1. HEADER SECTION ---

    // Add Wide Logo
    try {
        const logoUrl = '/auca_logo_wide.png';
        doc.addImage(logoUrl, 'PNG', 10, 10, 190, 42); // Maximum width: 190 wide, 42 high
    } catch (e) {
        console.warn("Logo not found, skipping image.");
    }

    // Divider Line
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(10, 56, 200, 56);

    // --- 2. REPORT METADATA ---

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    // Use dynamic title
    doc.text(reportTitle, 14, 66);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Report ID:", 14, 76);
    doc.setFont("helvetica", "normal");
    doc.text(`RPT-${Math.floor(10000000 + Math.random() * 90000000)}`, 45, 76);

    doc.setFont("helvetica", "bold");
    doc.text("Prepared By:", 14, 82);
    doc.setFont("helvetica", "normal");
    doc.text(`${currentUser.username || "Staff"} (${currentUser.role || "User"})`, 45, 82);

    doc.setFont("helvetica", "bold");
    doc.text("Generated On:", 14, 88);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), 45, 88);

    doc.setFont("helvetica", "bold");
    doc.text("Total Records:", 120, 76);
    doc.setFont("helvetica", "normal");
    doc.text(String(reportData.length), 150, 76);

    doc.setFont("helvetica", "bold");
    doc.text("Status:", 120, 82);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 128, 0);
    doc.text("VERIFIED", 150, 82);
    doc.setTextColor(0, 0, 0);

    // --- 3. DYNAMIC DATA TABLE ---
    let tableColumn = customColumns;
    let tableRows = customRows;

    // LEGACY FALLBACK (to avoid breaking other modules)
    if (!tableColumn || !tableRows) {
        tableColumn = ["No.", "Equipment Name", "Serial No.", "Category", "Borrowed Date", "Returned Date", "Student/User", "Status"];
        tableRows = [];
        reportData.forEach((item, index) => {
            const rowData = [
                index + 1,
                item.equipment?.name || "N/A",
                item.equipment?.serialNumber || "N/A",
                item.equipment?.category || "General",
                formatDate(item.createdAt),
                formatDate(item.expectedReturnTime || item.actualReturnTime || item.updatedAt),
                item.user?.username || item.user?.email || "Unknown",
                item.status
            ];
            tableRows.push(rowData);
        });
    }

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 96,
        theme: 'grid',
        headStyles: {
            fillColor: [248, 250, 252], // Light Blue/Gray to match metadata box
            textColor: [0, 0, 0],
            fontSize: 8,
            halign: 'center',
            fontStyle: 'bold',
            lineWidth: 0.1,
            lineColor: [226, 232, 240]
        },
        styles: {
            fontSize: 7,
            cellPadding: 3,
            valign: 'middle',
            halign: 'center',
            lineWidth: 0.1,
            lineColor: [226, 232, 240]
        },
        columnStyles: {
            1: { halign: 'left' },
            5: { halign: 'left' }
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        }
    });

    // --- 4. SIGNATURE FOOTER ---

    const finalY = doc.lastAutoTable.finalY + 20;

    if (finalY > 250) {
        doc.addPage();
        doc.text("", 14, 20);
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Reviewed By:", 14, finalY);
    doc.setFont("helvetica", "normal");
    doc.text("Name: ______________________", 14, finalY + 8);
    doc.text("Signature: _________________", 14, finalY + 18);
    doc.text("Date: ______________________", 14, finalY + 28);

    doc.setFont("helvetica", "bold");
    doc.text("Approved By:", 120, finalY);
    doc.setFont("helvetica", "normal");
    doc.text("Name: ______________________", 120, finalY + 8);
    doc.text("Signature: _________________", 120, finalY + 18);
    doc.text("Date: ______________________", 120, finalY + 28);

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Tracknity System Automated Report - Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
    }

    doc.save(`Tracknity_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};