import * as fs from 'fs';
import { PDFDocument } from 'pdf-lib';

const filePath = 'test_files/04.csv';

function readCSVData(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data.split('\n'));
        });
    });
}

async function processCSV(){
    try{
        const rows = await readCSVData();
        rows.forEach(row =>{
            const cols = row.split(',');
            console.log(cols);
        })
    } catch (err){
        console.log(err)
    }
}

processCSV();
