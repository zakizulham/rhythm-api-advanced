// src/services/storage/StorageService.js

import fs from 'fs';

class StorageService {
  constructor(folder) {
    this._folder = folder;

    // Cek apakah folder tujuan ada, kalo gak ada, bikin dulu
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, meta) {
    const filename = +new Date() + meta.filename; // Kasih timestamp biar unik
    const path = `${this._folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename)); // Balikin nama filenya aja
    });
  }
}

export default StorageService;