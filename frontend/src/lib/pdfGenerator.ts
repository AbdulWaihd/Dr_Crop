export function generateReportHtml(title: string, contentHtml: string): string {
  const date = new Date().toLocaleDateString(undefined, { 
    year: 'numeric', month: 'long', day: 'numeric', 
    hour: '2-digit', minute: '2-digit'
  });

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827; line-height: 1.6;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #10B981; padding-bottom: 20px; margin-bottom: 30px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; background: #059669; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 24px;">
            Dr
          </div>
          <div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #047857; letter-spacing: -0.02em;">Dr. Crop</h1>
            <p style="margin: 0; font-size: 14px; color: #6B7280; font-weight: 500;">AI Disease Detection & Copilot</p>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 12px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">DATE GENERATED</div>
          <div style="font-size: 14px; color: #374151; font-weight: 600;">${date}</div>
        </div>
      </div>

      <h2 style="font-size: 20px; font-weight: 700; color: #1F2937; margin-bottom: 24px;">${title}</h2>

      <div style="font-size: 14px; color: #374151; white-space: pre-wrap;">
        ${contentHtml}
      </div>

      <div style="margin-top: 60px; padding-top: 20px; border-top: 1px dashed #D1D5DB; text-align: center; font-size: 12px; color: #9CA3AF;">
        This report is AI-generated for informational purposes. Always consult local agricultural experts for critical field decisions.
      </div>
    </div>
  `;
}
