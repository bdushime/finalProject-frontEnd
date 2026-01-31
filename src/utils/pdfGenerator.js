import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Format date helper
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
};

// Now accepts a 3rd argument: 'reportTitle'
export const generatePDF = (reportData, currentUser, reportTitle = "EQUIPMENT REPORT") => {
    const doc = new jsPDF();

    // --- 1. HEADER SECTION ---
    
    // Add Logo
    try {
        const logoUrl = '/auca_logo.png'; 
        doc.addImage(logoUrl, 'PNG', 14, 10, 25, 25); 
    } catch (e) {
        console.warn("Logo not found, skipping image.");
    }

    // University Name
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text("ADVENTIST UNIVERSITY OF CENTRAL AFRICA", 115, 18, { align: "center" });

    // Address Line
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Gishushu Campus | P.O. Box 2461 Remera, Kigali, Rwanda", 115, 24, { align: "center" });
    doc.text("Phone: +250 788 888 888 | Email: info@auca.ac.rw", 115, 29, { align: "center" });

    // Divider Line
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 35, 196, 35);

    // --- 2. REPORT METADATA ---
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    // Use dynamic title
    doc.text(reportTitle, 14, 45);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Report ID:", 14, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`RPT-${Math.floor(10000000 + Math.random() * 90000000)}`, 45, 55);

    doc.setFont("helvetica", "bold");
    doc.text("Prepared By:", 14, 61);
    doc.setFont("helvetica", "normal");
    doc.text(`${currentUser.username || "Staff"} (${currentUser.role || "User"})`, 45, 61);

    doc.setFont("helvetica", "bold");
    doc.text("Generated On:", 14, 67);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), 45, 67);

    doc.setFont("helvetica", "bold");
    doc.text("Total Records:", 120, 55);
    doc.setFont("helvetica", "normal");
    doc.text(String(reportData.length), 150, 55);

    doc.setFont("helvetica", "bold");
    doc.text("Status:", 120, 61);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 128, 0); 
    doc.text("VERIFIED", 150, 61);
    doc.setTextColor(0, 0, 0); 

    // --- 3. DYNAMIC DATA TABLE ---
    
    const tableColumn = ["No.", "Equipment Name", "Serial No.", "Category", "Borrowed Date", "Student/User", "Status"];
    const tableRows = [];

    reportData.forEach((item, index) => {
        const rowData = [
            index + 1,
            item.equipment?.name || "N/A",
            item.equipment?.serialNumber || "N/A",
            item.equipment?.category || "General",
            formatDate(item.createdAt),
            item.user?.username || item.user?.email || "Unknown",
            item.status
        ];
        tableRows.push(rowData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 75,
        theme: 'grid',
        headStyles: {
            fillColor: [66, 66, 66], 
            textColor: [255, 255, 255],
            fontSize: 9,
            halign: 'center',
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 8,
            cellPadding: 3,
            valign: 'middle',
            halign: 'center',
            lineColor: [200, 200, 200]
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
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Tracknity System Automated Report - Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
    }

    doc.save(`Tracknity_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};