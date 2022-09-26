const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const express = require('express');
const fs = require('fs');
const Excel = require('exceljs');
const cors = require('cors');
const { ok } = require('assert');
const expApp = express();
const workbook = new Excel.Workbook();
const absolutPath = '/home/davi/Dokumentumok/dataize/'
const per = '/';
// const per = '\';

let win;
function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: { 
            nodeIntegration: true,
            devtools: false
        }
    })

    win.setMenu(null);
    win.maximize();

    if (isExpired()) {
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'fe' + per + 'index.html'),
            protocol: 'file:',
            slashes: true,
            webPreferences: { 
                nodeIntegration: true,
                devtools: false
            }
        }))
    }

    win.on('closed', () => {
        win = null;
    })
}

app.on('ready', createWindow);

expApp.use(express.urlencoded({ extended: false }));
expApp.use(express.json());
expApp.use(cors());

expApp.get('/getfilename/:id', getFileName);
expApp.post('/openfile/:id', openFile);
expApp.post('/writeline/:id', writeLine);
expApp.post('/createfile/:id', createFile);
expApp.post('/downloadcsvxlsx/:id', downloadCsvXlsx);
expApp.post('/downloadtemplate/:id', downloadTemplate);

console.log(__dirname);

expApp.listen(3000);

function createFile(req, res) {
    // let filePath = '.' + per + 'files' + per + req.params.id + per;
    let filePath = absolutPath;
    workbook.xlsx.readFile(filePath + 'templates' + per + req.body.item + '_template.xlsx')
        .then(function (value, err) {
            workbook.xlsx.writeFile(filePath + req.body.item + per + req.body.fileName + '.xlsx');
            workbook.csv.writeFile(filePath + req.body.item + per + req.body.fileName + '.csv');
            console.log(err);
        }).then(function () {
            const fullFilePath = filePath + 'init.json';
            const file = require(fullFilePath);
            file[req.body.item + "FileName"] = req.body.fileName;
            fs.writeFile(filePath + 'init.json', JSON.stringify(file), function writeJSON(err) {
                console.log(err);
            });
        }).then(() => {
            if (ok) {
                res.json({ message: 'File created!' });
            }
        }).catch((err) => {
            res.json({ message: err })
        });
}

function openFile(req, res) {
    // let filePath = '.' + per + 'files' + per + req.params.id + per;
    let filePath = absolutPath;
    if (fs.existsSync(filePath + req.body.item + per + req.body.fileName + '.xlsx' && filePath + req.body.item + per + req.body.fileName + '.csv')) {
        const fullFilePath = filePath + 'init.json';
        const file = require(fullFilePath);
        file[req.body.item + "FileName"] = req.body.fileName;
        fs.writeFile(filePath + 'init.json', JSON.stringify(file), function writeJSON(err) {
            console.log(err);
        });
        res.json({ message: file.fileName });
    } else {
        res.json({ message: 'File not found!' });
    }
}

async function getFileName(req, res) {
    res.json({ fileName: await readFileName(req) });
}

async function readFileName(req, res) {
    let filePath = absolutPath + 'init.json';
    const file = require(filePath);
    return file[req.query.item + 'FileName'];
}

async function writeLine(req, res) {
    // const filePathXlsx = '.' + per + 'files' + per + req.params.id + per + req.body.item + per + req.body.fileName + '.xlsx';
    // const filePathCsv = '.' + per + 'files' + per + req.params.id + per + req.body.item + per + req.body.fileName + '.csv';
    const filePathXlsx = absolutPath + req.body.item + per + req.body.fileName + '.xlsx';
    const filePathCsv = absolutPath + req.body.item + per + req.body.fileName + '.csv';
    const row = await req.body.line;
    console.log(row);
    workbook.xlsx.readFile(filePathXlsx)
        .then(function () {
            workbook.worksheets[0].addRow(row);
            workbook.xlsx.writeFile(filePathXlsx);
        }).then(
            workbook.csv.readFile(filePathCsv)
                .then(function () {
                    workbook.worksheets[0].addRow(row);
                    workbook.csv.writeFile(filePathCsv);
                }).catch(function (err) { console.log(err) }).then(res.json({ message: 'Book added!' }))
        );
}

async function downloadCsvXlsx(req, res) {
    const file = absolutPath + req.body.item + per + req.body.fileName;
    res.download(file);
}

async function downloadTemplate(req, res) {
    const file = absolutPath + 'templates' + per + req.body.item + '_template.xlsx';
    res.download(file);
}

function isExpired() {
    const currentDate = new Date().getTime();
    const expireDate = new Date("2022-10-20").getTime();
    return currentDate <= expireDate;
}
