const fs = require('fs');
const path = require('path');

// Storage directories to create
const storageRoot = 'C:\\KardexCare\\storage';
const directories = [
  storageRoot,
  path.join(storageRoot, 'images'),
  path.join(storageRoot, 'images', 'tickets'),
  path.join(storageRoot, 'images', 'activities'),
  path.join(storageRoot, 'images', 'profiles'),
  path.join(storageRoot, 'documents'),
  path.join(storageRoot, 'documents', 'tickets'),
  path.join(storageRoot, 'documents', 'reports'),
  path.join(storageRoot, 'backups'),
  path.join(storageRoot, 'backups', 'daily'),
  path.join(storageRoot, 'backups', 'weekly'),
  path.join(storageRoot, 'temp')
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    } else {
    }
});

