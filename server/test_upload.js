import fs from 'fs';
import { cloudinary } from './config/cloudinary.js';

async function testUpload() {
  // Create a minimal valid PDF
  const pdfContent = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 0 >>\nstream\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000213 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n264\n%%EOF\n';
  fs.writeFileSync('test.pdf', pdfContent);
  
  console.log("Uploading PDF as raw...");
  try {
    const resultRaw = await cloudinary.uploader.upload('test.pdf', {
      folder: 'epicB',
      resource_type: 'raw',
      use_filename: true,
      unique_filename: true
    });
    console.log("RAW RESULT:", resultRaw.secure_url);
  } catch (e) {
    console.log("RAW ERROR:", e);
  }
  
  console.log("Uploading PDF as auto...");
  try {
    const resultAuto = await cloudinary.uploader.upload('test.pdf', {
      folder: 'epicB',
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true
    });
    console.log("AUTO RESULT:", resultAuto.secure_url);
  } catch (e) {
    console.log("AUTO ERROR:", e);
  }
}

testUpload();
