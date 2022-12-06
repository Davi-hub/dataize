const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const url = require('url');
const express = require('express');
const Excel = require('exceljs');
const cors = require('cors');
const expApp = express();
const workbook = new Excel.Workbook();
// const pre = '..';
const pre = path.join('..' ,'..' ,'..');
const configFilePath = path.join(pre, 'config.json');
const configFile = require(path.join(configFilePath));

console.log(configFilePath);
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
expApp.post('/createfile', createFile);
expApp.post('/openfile', openFile);
expApp.post('/deleteitem', deleteItem);
expApp.post('/deletefile', deleteFile);
expApp.post('/writeline', writeLine);
expApp.post('/downloadcsvxlsx', downloadCsvXlsx);
expApp.post('/downloadtemplate', downloadTemplate);

expApp.listen(3000);

function createFile(req, res) {
    fs.writeFile(
        path.join(pre, req.body.item, req.body.fileName + '.json'), JSON.stringify([]),
        (err) => {
            if (err) {
                res.json(...err);
            } else {
                writeConfigFile(req, res);
            }
        }
    );
}

function openFile(req, res) {
    let itemPath = path.join(pre, req.body.item, req.body.fileName + '.json');
    console.log(itemPath);
    fs.exists(itemPath,
        (e) => {
            if (e) {
                writeConfigFile(req);
                readItemFile(req, res, (file) => {
                    file = JSON.parse(file);
                    addNo(file);
                    file = JSON.stringify(file);
                    res.json({ message: configFile[req.body.item + "FileName"], data: file });
                });
            } else {
                res.json({ message: 'File not found!' });
            }
        }
    )
}

async function deleteItem(req, res) {
    readItemFile(req, res, async (file) => {
        file = JSON.parse(file);
        file.splice(req.body.index, 1);
        addNo(file);
        file = JSON.stringify(file);
        fs.writeFile(path.join(pre, req.body.item, req.body.fileName + '.json'), file, (err) => {
            if (err) {
                res.send(err);
            } else {
                res.json({ message: "Item deleted!", data: file });
            }
        });
    });
}

async function getFileInfo(req, res) {
    const fileName = await configFile[req.query.item + 'FileName'];
    let picturePath = await configFile[req.query.item + 'FilePath'];
    console.log(picturePath);
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
    fs.readdir(path.join(pre, req.query.path), (err, files) => {
        res.send(files)
    });
}

async function readItemFile(req, res, cd) {
    fs.readFile(
        path.join(pre, req.body.item, req.body.fileName + '.json'),
        'utf8',
        (err, file) => {
            if (!err) {
                return cd(file);
            }
        }
    );
}

async function writeLine(req, res) {
    const filePath = path.join(pre, req.body.item, req.body.fileName + '.json');
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
                res.json({ message: 'Item added!' });
            }
        })
    })
}

async function downloadTemplate(req, res) {
    const file = path.join(pre, 'templates', req.body.item + '_template.xlsx');
    res.download(file);
}

function writeConfigFile(req, res) {
    if (req.body.fileName) configFile[req.body.item + "FileName"] = req.body.fileName;
    if (req.body.path) configFile[req.body.item + "FilePath"] = path.join('..' + '/' +  'pictures' + '/' +  req.body.path);
    fs.writeFile(configFilePath, JSON.stringify(configFile), (err) => {
        if (!err && res) {
            if (!req.body.fileName) {
                res.json({ 'message': 'Folder changed!' });
            } else {
                res.json({ 'message': 'File created!' });
            }
        }
    });
}

function downloadCsvXlsx(req, res) {
    workbook.xlsx.readFile(path.join(pre, 'templates', req.body.item + '_template.xlsx'))
        .then(function () {
            fs.readFile(
                path.join(pre, req.body.item, req.body.fileName + '.json'),
                'utf8',
                (err, fileContent) => {
                    console.log(err);
                    if (!err) {
                        let file = JSON.parse(fileContent);
                        if (req.body.item == 'book') {
                            convertBookFileToXlsx(file, workbook);
                        }
                        if (req.body.item == 'record') {
                            convertRecordFileToXlsx(file, workbook);
                        }
                    }
                }
            );
        }
        )
        .then(() => res.download(path.join(pre, 'templates', 'example.xlsx')));
}

function deleteFile(req, res) {
    let itemPath = path.join(pre, req.body.item, req.body.fileName + '.json');
    console.log(itemPath);
    fs.unlink(itemPath, (err) => {
        if (!err) {
            res.send("File deleted!");
        } else {
            res.send(err);
        }
    })
}

function addNo(file) {
    if (file.length > 0) {
        for (let i = 0; i < file.length; i++) {
            file[i].no = i + 1;
        }
    }
}

async function convertBookFileToXlsx(file, workbook) {
    for (let i = 0; i < file.length; i++) {
        let row = [
            file[i].date,
            '',
            file[i].numberOfPics.length,
            '261186',
            file[i].price,
            file[i].condition,
            'F' + (i + 1),
            '13', '7', '3', '2', '0', 'True', '3.0', 'False',
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
    workbook.xlsx.writeFile(path.join(pre, 'templates', 'example.xlsx'));
    return;
}

async function convertRecordFileToXlsx(file, workbook) {
    for (let i = 0; i < file.length; i++) {
        let row = [
            file[i].date,
            '',
            file[i].numberOfPics.length,
            '176985','', 'Used', 'TBD', '13', '1', '2', '0', '0', 'True', '3.0', 'False',
            file[i].barcode,
            file[i].composer,
            file[i].artist,
            file[i].conductor,
            file[i].release_title,
            'Vinyl', 'Record',
            file[i].format,
            file[i].genre,
            file[i].label,
            '12"',
            file[i].speed,
            file[i].year,
            'Black',
            file[i].country,
            'No'
        ];
        workbook.worksheets[0].addRow(row);
    }
    workbook.xlsx.writeFile(path.join(pre, 'templates', 'example.xlsx'));
    return;
}