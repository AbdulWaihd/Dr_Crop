import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function downloadPdfFromHtml(htmlContent: string, filename: string) {
  // Create a temporary container
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.width = "794px"; // A4 width at 96 DPI
  container.style.minHeight = "1123px"; // A4 height at 96 DPI
  container.style.backgroundColor = "white";
  container.style.color = "black";
  container.style.padding = "40px";
  container.style.boxSizing = "border-box";
  container.style.fontFamily = "sans-serif";
  container.innerHTML = htmlContent;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    // Calculate how many pages we need
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // For simplicity, if it's longer than 1 page, we just scale it to fit or let it overflow (usually 1 page is fine for these reports, or we can add pages)
    // A4 is 297mm height
    const pageHeight = 297;
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}
