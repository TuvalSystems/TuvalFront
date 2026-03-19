import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs'; // Añadimos estas dos
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

      // 1. Definimos la ruta de la carpeta
      const dirPath = resolve(__dirname, 'vue');
      const filePath = resolve(dirPath, 'version.json');

      try {
        // 2. Si la carpeta 'vue' no existe, la creamos
        if (!existsSync(dirPath)) {
          mkdirSync(dirPath, { recursive: true });
        }

        // 3. Ahora sí, escribimos el archivo
        writeFileSync(filePath, JSON.stringify(versionData, null, 2));
        console.log('✅ Archivo version.json generado con éxito en:', filePath);
      } catch (error) {
        console.error('❌ Error al generar version.json:', error.message);
      }
    },
  };
}