import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { GeneratedContent } from '@/types/studyMaterials';

interface PDFOptions {
  title: string;
  difficulty?: string;
  fileName?: string;
  watermark?: string; // User's real name
}

const initializePDF = (title: string, difficulty?: string, watermark?: string): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // App header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('Universal Study Material Generator', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text(title, pageWidth / 2, 25, { align: 'center' });
  
  if (difficulty) {
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Difficulty Level: ${difficulty}`, pageWidth / 2, 33, { align: 'center' });
  }
  
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Generated on ${date}`, pageWidth / 2, 40, { align: 'center' });
  
  // Watermark if provided
  if (watermark) {
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text(`Generated for: ${watermark}`, pageWidth / 2, 47, { align: 'center' });
  }
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 50, pageWidth - 20, 50);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');
  
  return doc;
};

// Add page numbers to all pages
const addPageNumbers = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
};

export const downloadSummaryPDF = (summary: string, options: PDFOptions) => {
  const doc = initializePDF(options.title, options.difficulty, options.watermark);
  
  doc.setFontSize(12);
  const margin = 20;
  const maxWidth = doc.internal.pageSize.getWidth() - 2 * margin;
  
  const lines = doc.splitTextToSize(summary, maxWidth);
  doc.text(lines, margin, 58);
  
  addPageNumbers(doc);
  
  const fileName = options.fileName || 'study-summary.pdf';
  doc.save(fileName);
};

export const downloadFlashcardsPDF = (
  flashcards: Array<{ question: string; answer: string }>,
  options: PDFOptions
) => {
  const doc = initializePDF(options.title, options.difficulty, options.watermark);
  
  const tableData = flashcards.map((card, index) => [
    `${index + 1}`,
    card.question,
    card.answer
  ]);
  
  autoTable(doc, {
    startY: 58,
    head: [['#', 'Question', 'Answer']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [98, 70, 234],
      fontSize: 11,
      fontStyle: 'bold',
      textColor: 255
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 80 }
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
      overflow: 'linebreak'
    }
  });
  
  addPageNumbers(doc);
  
  const fileName = options.fileName || 'flashcards.pdf';
  doc.save(fileName);
};

export const downloadMCQsPDF = (
  mcqs: Array<{ question: string; options: string[]; correctAnswer: number }>,
  options: PDFOptions
) => {
  const doc = initializePDF(options.title, options.difficulty, options.watermark);
  
  let yPosition = 58;
  const margin = 20;
  const pageHeight = doc.internal.pageSize.getHeight();
  
  mcqs.forEach((mcq, index) => {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    const questionText = `${index + 1}. ${mcq.question}`;
    const questionLines = doc.splitTextToSize(questionText, doc.internal.pageSize.getWidth() - 2 * margin);
    doc.text(questionLines, margin, yPosition);
    yPosition += questionLines.length * 6 + 3;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    mcq.options.forEach((option, optIndex) => {
      const isCorrect = optIndex === mcq.correctAnswer;
      const letter = String.fromCharCode(65 + optIndex);
      const optionText = `${letter}. ${option}`;
      
      if (isCorrect) {
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 128, 0);
      }
      
      const optionLines = doc.splitTextToSize(optionText, doc.internal.pageSize.getWidth() - 2 * margin - 5);
      doc.text(optionLines, margin + 5, yPosition);
      yPosition += optionLines.length * 5 + 2;
      
      if (isCorrect) {
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
      }
    });
    
    yPosition += 8;
  });
  
  addPageNumbers(doc);
  
  const fileName = options.fileName || 'mcqs.pdf';
  doc.save(fileName);
};

export const downloadTrueFalsePDF = (
  trueFalse: Array<{ statement: string; answer: boolean }>,
  options: PDFOptions
) => {
  const doc = initializePDF(options.title, options.difficulty, options.watermark);
  
  const tableData = trueFalse.map((item, index) => [
    `${index + 1}`,
    item.statement,
    item.answer ? 'True' : 'False'
  ]);
  
  autoTable(doc, {
    startY: 58,
    head: [['#', 'Statement', 'Answer']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [98, 70, 234],
      fontSize: 11,
      fontStyle: 'bold',
      textColor: 255
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 135 },
      2: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
      overflow: 'linebreak'
    },
    didDrawCell: (data: any) => {
      if (data.column.index === 2 && data.section === 'body') {
        if (data.cell.text[0] === 'True') {
          doc.setTextColor(0, 128, 0);
        } else {
          doc.setTextColor(200, 0, 0);
        }
      }
    }
  });
  
  addPageNumbers(doc);
  
  const fileName = options.fileName || 'true-false.pdf';
  doc.save(fileName);
};

export const downloadDefinitionsPDF = (
  definitions: Array<{ term: string; definition: string }>,
  options: PDFOptions
) => {
  const doc = initializePDF(options.title, options.difficulty, options.watermark);
  
  const tableData = definitions.map((item, index) => [
    `${index + 1}`,
    item.term,
    item.definition
  ]);
  
  autoTable(doc, {
    startY: 58,
    head: [['#', 'Term', 'Definition']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [98, 70, 234],
      fontSize: 11,
      fontStyle: 'bold',
      textColor: 255
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 45, fontStyle: 'bold' },
      2: { cellWidth: 115 }
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
      overflow: 'linebreak'
    }
  });
  
  addPageNumbers(doc);
  
  const fileName = options.fileName || 'definitions.pdf';
  doc.save(fileName);
};

export const downloadExplanationPDF = (
  explanation: string,
  options: PDFOptions
) => {
  const doc = initializePDF(options.title, options.difficulty, options.watermark);
  
  doc.setFontSize(12);
  const margin = 20;
  const maxWidth = doc.internal.pageSize.getWidth() - 2 * margin;
  
  const lines = doc.splitTextToSize(explanation, maxWidth);
  doc.text(lines, margin, 58);
  
  addPageNumbers(doc);
  
  const fileName = options.fileName || 'explanation.pdf';
  doc.save(fileName);
};

export const downloadAllContentPDF = (
  content: GeneratedContent,
  difficulty: string,
  watermark?: string
) => {
  const doc = initializePDF('Complete Study Materials', difficulty, watermark);
  let yPosition = 58;
  const margin = 20;
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = doc.internal.pageSize.getWidth() - 2 * margin;
  
  const addSection = (title: string) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(98, 70, 234);
    doc.text(title, margin, yPosition);
    yPosition += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
  };
  
  if (content.summary) {
    addSection('Summary');
    const lines = doc.splitTextToSize(content.summary, maxWidth);
    doc.text(lines, margin, yPosition);
    yPosition += lines.length * 5 + 12;
  }
  
  if (content.kidsExplanation) {
    addSection('Kids Mode Explanation');
    const lines = doc.splitTextToSize(content.kidsExplanation, maxWidth);
    doc.text(lines, margin, yPosition);
    yPosition += lines.length * 5 + 12;
  }
  
  if (content.professionalExplanation) {
    addSection('Professional Explanation');
    const lines = doc.splitTextToSize(content.professionalExplanation, maxWidth);
    doc.text(lines, margin, yPosition);
    yPosition += lines.length * 5 + 12;
  }
  
  if (content.definitions && content.definitions.length > 0) {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }
    addSection('Key Definitions');
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Term', 'Definition']],
      body: content.definitions.map(d => [d.term, d.definition]),
      theme: 'grid',
      headStyles: { 
        fillColor: [98, 70, 234],
        fontSize: 10,
        fontStyle: 'bold',
        textColor: 255
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 125 }
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 12;
  }
  
  if (content.flashcards && content.flashcards.length > 0) {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }
    addSection('Flashcards');
    
    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Question', 'Answer']],
      body: content.flashcards.map((card, i) => [`${i + 1}`, card.question, card.answer]),
      theme: 'grid',
      headStyles: { 
        fillColor: [98, 70, 234],
        fontSize: 10,
        fontStyle: 'bold',
        textColor: 255
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 80 },
        2: { cellWidth: 80 }
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 12;
  }
  
  if (content.trueFalse && content.trueFalse.length > 0) {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }
    addSection('True/False Questions');
    
    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Statement', 'Answer']],
      body: content.trueFalse.map((item, i) => [
        `${i + 1}`,
        item.statement,
        item.answer ? 'True' : 'False'
      ]),
      theme: 'grid',
      headStyles: { 
        fillColor: [98, 70, 234],
        fontSize: 10,
        fontStyle: 'bold',
        textColor: 255
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 140 },
        2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 12;
  }
  
  if (content.mcqs && content.mcqs.length > 0) {
    doc.addPage();
    yPosition = 20;
    addSection('Multiple Choice Questions');
    
    content.mcqs.forEach((mcq, index) => {
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      const questionText = `${index + 1}. ${mcq.question}`;
      const questionLines = doc.splitTextToSize(questionText, maxWidth);
      doc.text(questionLines, margin, yPosition);
      yPosition += questionLines.length * 5 + 3;
      
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      mcq.options.forEach((option, optIndex) => {
        const isCorrect = optIndex === mcq.correctAnswer;
        const letter = String.fromCharCode(65 + optIndex);
        const optionText = `${letter}. ${option}`;
        
        if (isCorrect) {
          doc.setFont(undefined, 'bold');
          doc.setTextColor(0, 128, 0);
        }
        
        const optionLines = doc.splitTextToSize(optionText, maxWidth - 5);
        doc.text(optionLines, margin + 5, yPosition);
        yPosition += optionLines.length * 4 + 2;
        
        if (isCorrect) {
          doc.setFont(undefined, 'normal');
          doc.setTextColor(0, 0, 0);
        }
      });
      
      yPosition += 6;
    });
  }
  
  addPageNumbers(doc);
  
  doc.save('complete-study-materials.pdf');
};
