import { NextRequest, NextResponse } from 'next/server'
import HTMLtoDOCX from 'html-to-docx'

export async function POST(request: NextRequest) {
    try {
        const { html, filename } = await request.json()
        const origin = request.nextUrl.origin

        if (!html) {
            return NextResponse.json(
                { error: 'HTML content is required' },
                { status: 400 }
            )
        }

        // Process HTML to make relative image paths absolute
        // This is crucial for html-to-docx to fetch/embed images correctly
        let processedHtml = html.replace(/src="\/(?!\/)/g, `src="${origin}/`)

        // Also handle single quotes and cases where src doesn't start with /
        processedHtml = processedHtml.replace(/src='\/(?!\/)/g, `src='${origin}/`)

        // Create full HTML document with styles for Word compatibility
        const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          /* ==================== CORE DOCUMENT STYLES ==================== */
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            font-size: 10.5pt; 
            line-height: 1.35;
            color: #1a202c; 
            margin: 0;
            padding: 0;
          }
          
          /* Forced Page Structure */
          .page { 
            page-break-after: always;
            break-after: page;
            margin: 0;
            padding: 40px;
            height: 1000px; /* Force overflow control */
          }
          
          .page:last-child {
            page-break-after: avoid;
            break-after: avoid;
          }
          
          /* ==================== FOOTERS ==================== */
          /* Word handles pagination, so we style the per-page footers to stick to the bottom */
          .page-footer {
            border-top: 1pt solid #cbd5e1;
            margin-top: 20px;
            padding-top: 10px;
            width: 100%;
          }
          
          .footer-content {
            display: block;
            width: 100%;
            font-size: 9pt;
            color: #64748b;
          }
          
          .footer-content span {
            display: inline-block;
            width: 33%;
          }
          
          /* ==================== BRANDED TITLES ==================== */
          .page-title { 
            text-align: center; 
            margin: 40px 0;
          }
          
          .page-title h1 span { 
            background-color: #4472C4; 
            color: #ffffff; 
            padding: 10px 40px; 
            font-size: 15pt; 
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 4pt solid #365ba3;
          }
          
          .quote-main-title { 
            text-align: center; 
            color: #4472C4; 
            margin: 20px 0;
            font-size: 16pt;
          }
          
          .quote-title-underlined { 
            text-decoration: underline; 
            font-size: 18pt; 
            font-weight: bold;
            color: #4472C4;
          }
          
          /* ==================== HEADERS & INFO ==================== */
          .quote-header-simple { 
            margin-bottom: 25px; 
            width: 100%;
          }
          
          .quote-ref-info p { 
            margin: 0; 
            font-weight: bold;
          }
          
          .customer-details-simple { 
            margin-bottom: 20px; 
            line-height: 1.5;
          }
          
          .customer-name { 
            font-size: 11pt; 
            font-weight: bold;
            color: #1a202c;
          }
          
          .kind-attention-text { 
            color: #4472C4; 
            font-weight: bold;
            font-size: 11pt;
            margin-top: 15px;
          }
          
          /* ==================== TABLES ==================== */
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0; 
            border: 0.75pt solid #cbd5e1; 
          }
          
          th { 
            background-color: #4472C4; 
            color: #ffffff; 
            font-weight: bold; 
            padding: 10px 8px; 
            border: 0.75pt solid #1e5f8b; 
            text-transform: uppercase; 
            font-size: 9pt;
            text-align: left;
          }
          
          td { 
            padding: 8px; 
            border: 0.75pt solid #cbd5e1; 
            vertical-align: top;
            font-size: 9pt;
          }
          
          .grand-total-row { 
            background-color: #f1f7ff; 
            font-weight: bold;
          }
          
          .grand-total-row td { 
            color: #4472C4; 
            font-size: 12pt; 
            border-top: 2pt solid #4472C4; 
            padding: 10px 8px;
          }
          
          /* ==================== TERMS & CONDITIONS ==================== */
          .terms-page { 
            font-size: 9pt; 
            line-height: 1.35; 
            color: #4a5568;
          }
          
          .terms-content h4 { 
            color: #2d3748; 
            font-weight: bold; 
            margin: 10px 0 5px 0; 
            font-size: 10.5pt;
          }
          
          .terms-content p { 
            margin-bottom: 5px; 
            text-align: justify;
          }
          
          /* ==================== UTILITIES ==================== */
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .mb-4 { margin-bottom: 16px; }
          .mt-8 { margin-top: 32px; }
          .print\\:hidden { display: none !important; }
          
          /* Signature display fix */
          .signature-container img {
            max-width: 180px;
            max-height: 90px;
          }
        </style>
      </head>
      <body>
        ${processedHtml}
      </body>
      </html>
    `

        // Convert HTML to DOCX
        const docxBuffer = await HTMLtoDOCX(fullHtml, null, {
            table: { row: { cantSplit: true } },
            footer: true,
            pageNumber: true,
        })

        // Return the DOCX file
        const headers = new Headers()
        headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        headers.set('Content-Disposition', `attachment; filename="${filename || 'quote.docx'}"`)

        return new NextResponse(docxBuffer, {
            status: 200,
            headers,
        })
    } catch (error: any) {
        console.error('Error generating Word document:', error)
        return NextResponse.json(
            { error: 'Failed to generate Word document', details: error.message },
            { status: 500 }
        )
    }
}
