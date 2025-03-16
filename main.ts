import * as fs from 'fs';
import { PDFDocument } from 'pdf-lib';

const filePath = 'test_files/04.csv';

function readAndProcessCSV(): Promise<string[][]> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            const cleanData = data.replace(/^\uffeff/, '')
            const rows = cleanData.split('\n');
            const processedRows = rows.map(row => row.split(','));
            resolve(processedRows);
        });
    });
}

async function fillPDF(rows: string[][]){
    const pdf = fs.readFileSync('test_files/fillpdf.pdf');
    const pdfDoc = await PDFDocument.load(pdf);
    const page = pdfDoc.getPages()[0];
    for(let i=0; i<rows[0].length; i++){
        page.drawText(rows[0][i],{
            x: 50,
            y: 40,
            size: 30
        })
    }
    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync('test_files/modified.pdf', pdfBytes);
}

async function main() {
    try {
        const processedRows = await readAndProcessCSV();
        const cleanData = processedRows.map((row: string[]) =>
            row.map((val: string) => val.replace(/[\ufeff\ufffe\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ''))
        );
        await fillPDF(cleanData);
    } catch (err) {
        console.error(err);
    }
}

main();