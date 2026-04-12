import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export async function downloadPdfFromHtml(htmlContent: string, filename: string) {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.padding = "40px";
  container.style.background = "#ffffff";
  container.style.color = "#000000";
  container.style.boxSizing = "border-box";
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    // Small delay to ensure styles are applied
    await new Promise(r => setTimeout(r, 100));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.9);
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // Add first page
    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    
    // Check if we need more pages (A4 height is 297mm)
    let heightLeft = pdfHeight - 297;
    let pageCount = 1;

    while (heightLeft > 0) {
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, -(pageCount * 297), pdfWidth, pdfHeight, undefined, 'FAST');
      heightLeft -= 297;
      pageCount++;
    }

    const finalName = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    pdf.save(finalName);
  } catch (error) {
    console.error("PDF download failed:", error);
  } finally {
    document.body.removeChild(container);
  }
}
