const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const url = require('url');
const express = require('express');
const Excel = require('exceljs');
const cors = require('cors');
const expApp = express();
const workbook = new Excel.Workbook();
const configFilePath = path.join(__dirname, 'config.json');
const configFile = require(path.join(configFilePath));
const { v1: uuidv1, v4: uuidv4, } = require('uuid');
const { dirname } = require('path');

let win;
function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            devtools: true
        }
    })

    // win.setMenu(null);
    win.maximize();

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'fe', 'index.html'),
        protocol: 'file:',
        slashes: true,
        webPreferences: {
            nodeIntegration: true,
            devtools: true
        }
    }))

    win.on('closed', () => {
        win = null;
    })
}

app.on('ready', createWindow);

expApp.use(express.urlencoded({ extended: false }));
expApp.use(express.json());
expApp.use(cors());

expApp.get('/getfileinfo', getFileInfo);
expApp.get('/getfilenames', getFileNames);
expApp.post('/openfile', openFile);
expApp.post('/writeline', writeLine);
expApp.post('/createfile', createFile);
// expApp.post('/updatePicsPath', updatePicsPath);
expApp.post('/downloadcsvxlsx', downloadCsvXlsx);
expApp.post('/downloadtemplate', downloadTemplate);

expApp.listen(3000);

function createFile(req, res) {
    fs.writeFile(
        path.join(__dirname, req.body.item, req.body.fileName + '.json'), JSON.stringify([]),
        (err) => {
            if (err) {
                throw err;
            } else {
                writeConfigFile(req);
                res.json({ 'message': 'File created!' });
            }
        }
    );
}

function openFile(req, res) {
    let itemPath = path.join(__dirname, req.body.item, req.body.fileName + '.json');
    console.log(itemPath);
    fs.exists(itemPath,
        (e) => {
            if (e) {
                writeConfigFile(req);
                readItemFile(req, res);
            } else {
                res.json({ message: 'File not found!' });
            }
        }
    )
}

async function getFileInfo(req, res) {
    // const info = await readFileInfo(req)
    const fileName = await configFile[req.query.item + 'FileName'];
    let picturePath = await configFile[req.query.item + 'FilePath'];
    picturePath = path.join(__dirname, picturePath.split('../')[1]);
    fs.readdir(picturePath,
        (err, files) => {
            if (!err) {
                res.json({ fileName: fileName, path: picturePath, pictures: files })
            } else {
                res.json(err);
            }
        }
    );
}

async function getFileNames(req, res) {
    fs.readdir(path.join(__dirname, req.query.item), (err, files) => res.send(files));
    // res.json({ fileName: await readFileName(req) });
}

async function readItemFile(req, res) {
    fs.readFile(
        path.join(__dirname, req.body.item, req.body.fileName + '.json'),
        'utf8',
        (err, fileContent) => {
            if (!err) {
                let file = JSON.parse(fileContent);
                if (file.length > 0) {
                    for (let i = 0; i < file.length; i++) {
                        file[i].no = i + 1;
                    }
                }
                file = JSON.stringify(file);
                res.json({ message: configFile[req.body.item + "FileName"], data: file });
            }
        }
    );
}

async function writeLine(req, res) {
    const filePath = path.join(__dirname, req.body.item, req.body.fileName + '.json');
    const row = await req.body.line;
    fs.readFile(filePath, (err, fileContent) => {
        let items = [];
        if (!err) {
            items = JSON.parse(fileContent);
        }
        if (row.no) {
            items.splice(row.no - 1, 1, row);
        } else {
            items.push(row);
        }
        fs.writeFile(filePath, JSON.stringify(items), (err) => {
            if (err) {
                res.send(err);
            } else {
                res.send('Item added!');
            }
        })
    })
}

// async function downloadCsvXlsx(req, res) {
//     const file = path.join(__dirname, req.body.item, req.body.fileName);
//     res.download(file);
// }

async function downloadTemplate(req, res) {
    const file = path.join(__dirname, 'templates', req.body.item + '_template.xlsx');
    res.download(file);
}

function writeConfigFile(req) {
    if (req.body.fileName) configFile[req.body.item + "FileName"] = req.body.fileName;
    if (req.body.path) configFile[req.body.item + "FilePath"] = path.join('..', 'pictures', req.body.path);
    fs.writeFile(configFilePath, JSON.stringify(configFile), (err) => console.log(err));
}

function downloadCsvXlsx(req, res) {
    workbook.xlsx.readFile(path.join(__dirname, 'templates', req.body.item + '_template.xlsx'))
        .then(function () {
            fs.readFile(
                path.join(__dirname, req.body.item, req.body.fileName + '.json'),
                'utf8',
                (err, fileContent) => {
                    console.log(err);
                    if (!err) {
                        let file = JSON.parse(fileContent);
                        console.log(fileContent);
                        for (let i = 0; i < file.length; i++) {
                            let row = [
                                file[i].date,
                                '',
                                file[i].numberOfPics.length,
                                '',
                                file[i].price,
                                file[i].condition,
                                'F' + (i+1),
                                '', '', '', '', '', 'True', '3.0', 'No',
                                file[i].publish_date,
                                file[i].country,
                                file[i].title,
                                file[i].subtitle,
                                file[i].authors,
                                file[i].publishers,
                                file[i].language,
                                file[i].isbn,
                                file[i].format,
                                file[i].features,
                                file[i].edition,
                                file[i].inscribed,
                                file[i].signed,
                                file[i].vintage,
                                'No', 'No', 'No'
                            ];
                            workbook.worksheets[0].addRow(row);
                        }
                        workbook.xlsx.writeFile(path.join(__dirname, 'templates', 'example.xlsx'));
                    }
                }
            );
        }
        ).then(() => res.download(path.join(__dirname, 'templates', 'example.xlsx')));
}