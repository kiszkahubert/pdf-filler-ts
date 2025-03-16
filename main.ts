import * as fs from 'fs';
import { PDFDocument, StandardFonts } from 'pdf-lib';

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
/**
 * Top left corner of the table has coordinates (x,y) = (136,338)
 * Bottom left corner of the table has coordinates (x,y) = (136,127)
 * Up to the ETO column we need to increment x coordinate by 26
 * Up to the ETO column we need to decrement y coordinate by 30
 */

async function fillPDF(rows: string[][]){
    const pdf = fs.readFileSync('test_files/fillpdf.pdf');
    const pdfDoc = await PDFDocument.load(pdf);
    const courierFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
    const page = pdfDoc.getPages()[0];
    // page.drawText("1234",{
    //     x: 136,
    //     y: 338,
    //     size: 10,
    //     font: courierFont
    // })
    // page.drawText("1234",{
    //     x: 136,
    //     y: 308,
    //     size: 10,
    //     font: courierFont
    // })
    for(let i=0; i<rows[0].length; i++){
        page.drawText(rows[0][i],{
            x: 136 + 26*i,
            y: 338,
            size: 10
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