// eslint.config.js
import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  // Terapin konfigurasi bawaan yang direkomendasiin
  pluginJs.configs.recommended,
  
  // Konfigurasi spesifik buat proyek kita
  {
    languageOptions: {
      ecmaVersion: 'latest', // Pake JavaScript versi terbaru
      sourceType: 'module', // Pake ES Modules (import/export)
      globals: {
        ...globals.node, // Aktifin environment Node.js
      },
    },
    rules: {
      // Aturan yang kita longgarin
      'no-console': 'off', // Boleh pake console.log
      'no-unused-vars': [
        'warn',
        {
            argsIgnorePattern: '^h$', // Gak usah peduliin argumen 'h'
            caughtErrorsIgnorePattern: '^_', // Gak usah peduliin error di catch yang diawalin _
        },
      ],
      'no-underscore-dangle': 'off', // Boleh pake underscore di awal (cth: _service)
    },
  },
  {
    // Abaikan folder node_modules
    ignores: ['node_modules/'],
  },
];