import * as fs from 'fs';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const filePath = 'test_files/01.csv';

function readAndProcessCSV(): Promise<string[][]> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            const cleanData = data.replace(/^\uffeff/, '')
            const rows = cleanData.split(/\r?\n/);
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
 * Each char has a width of 6px
 * First of two wide boxes begins at (x,y) = (296,338) with x offset 32
 * First normal width box after two wide begins at (x,y) = (358,338) and following with x offset of 27
 * Offset Y between each box is 30 
 */

async function fillPDF(rows: string[][]){
    const pdf = fs.readFileSync('test_files/fillpdf.pdf');
    const pdfDoc = await PDFDocument.load(pdf);
    const courierFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
    const page = pdfDoc.getPages()[0];
    for(let j=0; j<8; j++){
        for(let i=0; i<rows[j].length; i++){
            const text = rows[j][i];
            const textWidth = courierFont.widthOfTextAtSize(text,10);
            console.log(text);
            if(i < 6){
                page.drawText(text,{
                    x: 136 + 26*i + (24-textWidth)/2,
                    y: 338-30*j,
                    size: 10,
                    font: courierFont
                })
            } else if(i == 6 || i == 7){
                page.drawText(text,{
                    x: 296 + 32*(i%6) + (24-textWidth)/2,
                    y: 338-30*j,
                    size: 10,
                    font: courierFont
                })
            } else{
                page.drawText(text,{
                    x: 358 + 27*(i%8) + (24-textWidth)/2,
                    y: 338-30*j,
                    size: 10,
                    font: courierFont
                })
            }
        }
    }
    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync('test_files/modified.pdf', pdfBytes);
}

async function main() {
    try {
        const processedRows = await readAndProcessCSV();
        console.log(processedRows);
        const cleanData = processedRows.map((row: string[]) =>
            row.map((val: string) => val.replace(/[\ufeff\ufffe\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ''))
        );
        await fillPDF(cleanData);
    } catch (err) {
        console.error(err);
    }
}

main();