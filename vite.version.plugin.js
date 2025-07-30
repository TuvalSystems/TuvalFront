import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

export default function versionPlugin() {
  return {
    name: 'generate-version',
    closeBundle() {
      const versionData = {
        gitCommitHash: execSync('git rev-parse --short HEAD').toString().trim(),
        buildDate: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      };

      const filePath = resolve(__dirname, 'vue', 'version.json');
      writeFileSync(filePath, JSON.stringify(versionData, null, 2));

      console.log('✅ Archivo version.json generado:', versionData);
    },
  };
}
