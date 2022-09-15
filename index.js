
const cheerio = require("cheerio");
const fs = require('fs');
const axios = require('axios');

let id = 'https://vk.com/id123123124';
let media = [
    ["http", ".jpg"],
    ["video", ".mp4"],
    ["ogg", ".ogg"],

    ["SIZE", ".png"],
]

let picture = media[0][0];
let pictureFormat = media[0][1];

let voice = media[2][0];
let voiceFormat = media[2][1];

let resolution = media[3][1];
let resolutionFormat = media[3][1]

let search = picture;
let format = pictureFormat;
let sources = [];
let fileNames = [];
let countValue = 0;
let savePath = '';



async function getPage(fileName) {
    let countPage = fs.readFileSync(`./messages/${fileName}`, "utf-8", err =>
        console.log(err));
    console.log(fileName + " checked")
    let $ = cheerio.load(countPage);
    let itemSelectors = $('.item');
    let select = itemSelectors.each(async function (idx, el) {
        let element = cheerio.load(el);
        if (element.html().includes(id)) {
            if (element.html().includes("http")) {
                if (element.html().includes(search)) {
                    let elementWithHref = element.html();
                    if (elementWithHref === undefined) return
                    try {
                        let sourcesAmp = elementWithHref.split("href")[2].split("\"")[1];
                        let sliceAmp = sourcesAmp.split('amp;').join("");
                        console.log(sliceAmp)
                        sources.push(sliceAmp)
                    } catch (err) {
                    }
                }
            }
        }
    })
}

function getCountFiles() {
    return new Promise((resolve, reject) => {
        let valueLength = 0;
        fs.readdir('./messages/', (err, files) => {
            if (err) {
                reject(new Error(err))
            }
            files.forEach(file => {
                fileNames.push(file)
            })
            console.log(fileNames)
            return resolve(countValue)
        })

    })
}

function getFolder() {
    return new Promise((resolve, reject) => {
        if (search === picture) {
            resolve()
            savePath = `${picture}`;
            console.log(savePath)
        }
    })
}

function createFolder() {
    return new Promise((resolve, reject) => {
        fs.mkdir(`${savePath}`, { recursive: true }, err => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    })
}

async function downloadFile(countArray, filename) {
    try {
        await createFolder();
    } catch (err) {
        console.log('error')
    }
    try {
        let response = await axios({
            url: `${countArray}`,
            method: "GET",
            responseType: "stream"
        });

        let writer = response.data.pipe(fs.createWriteStream(savePath + `/${filename}${format}`));
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve)
            writer.on('error', err => {
                reject(console.log(err));
            })
        });
    } catch (err) {
        console.log('Done')
    }
}

async function s() {
    await getFolder()
    await getCountFiles();
    for (let i = 0; i < fileNames.length; i++) {
        await getPage(fileNames[i]);
    }
    for (let i = 0; i <= sources.length; i++) {
        await downloadFile(sources[i], i)
        if (typeof (sources[i]) !== 'undefined') {
            console.log(sources[i] + ' \n downloaded.')
        }
    }
};

s()