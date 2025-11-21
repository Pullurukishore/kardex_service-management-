const fs = require('fs');
const path = require('path');

// Check if uploads folder exists
const uploadsDir = 'C:\\KardexCare\\backend\\uploads';
const storageDir = 'C:\\KardexCare\\storage';

if (fs.existsSync(uploadsDir)) {
  // List current files
  const files = fs.readdirSync(uploadsDir);
  files.forEach(file => {
    const stats = fs.statSync(path.join(uploadsDir, file));
    });
  
  // Move files to storage (optional)
  files.forEach(file => {
    const oldPath = path.join(uploadsDir, file);
    const newPath = path.join(storageDir, 'images', 'legacy', file);
    
    // Create legacy folder
    const legacyDir = path.join(storageDir, 'images', 'legacy');
    if (!fs.existsSync(legacyDir)) {
      fs.mkdirSync(legacyDir, { recursive: true });
    }
    
    // Move file
    fs.renameSync(oldPath, newPath);
    });
  
  // Remove empty uploads folder
  fs.rmdirSync(uploadsDir);
  } else {
  }

