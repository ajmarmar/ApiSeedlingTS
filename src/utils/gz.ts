import * as fs from 'fs';
import * as zlib from 'zlib';

// Comprimir un archivo de forma síncrona
export function compressFileSync(inputPath: string, outputPath: string) {
    const input = fs.readFileSync(inputPath);
    const compressedData = zlib.gzipSync(input);
    fs.writeFileSync(`${outputPath}.gz`, compressedData);
    console.log('Archivo comprimido correctamente.');
}

// Descomprimir un archivo de forma síncrona
export function descompressFileSync(inputPath: string, outputPath: string) {
    const input = fs.readFileSync(inputPath);
    const decompressedData = zlib.gunzipSync(input);
    fs.writeFileSync(outputPath, decompressedData);
    console.log('Archivo descomprimido correctamente.');
}
