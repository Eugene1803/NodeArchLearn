const fs = require('fs');
const {
    createReadStream,
    createWriteStream
} = require('fs');
const zlib = require('zlib');
const {find} = require('lodash');
const {promisify} = require('util');
const {pipeline} = require('stream');
const {createGzip} = require('zlib');

const pipe = promisify(pipeline);

async function do_gzip(input, output) {
    const gzip = createGzip();
    const source = createReadStream(input);
    const destination = createWriteStream(output);
    await pipe(source, gzip, destination);
}

const autoCompressor = async path => {
    const dir = await fs.promises.opendir(path);
    console.log(`началось сканирование директории ${path}`);
    const dirContentArr = await fs.promises.readdir(path, {withFileTypes: true});

    for (const dirent of dirContentArr) {
        try {
            if (dirent.isDirectory()) {
                await autoCompressor(`${path}/${dirent.name}`);
            } else if (!dirent.name.match(/^.*(.gz)$/g)) {
                if (find(dirContentArr, {name: `${dirent.name}.gz`})) {
                    const {ctimeMs: origFileChangeTimeMs} = await fs.promises.stat(`${path}/${dirent.name}`);
                    const {ctimeMs: compressedFileChangeTimeMs} = await fs.promises.stat(`${path}/${dirent.name}.gz`);
                    if(origFileChangeTimeMs > compressedFileChangeTimeMs) {
                        console.log('началось обновление сжатой версии файла ' + `${path}/${dirent.name}`);
                        await fs.promises.unlink(`${path}/${dirent.name}.gz`);
                        await do_gzip(`${path}/${dirent.name}`, `${path}/${dirent.name}.gz`);
                        console.log('закончилось обновление сжатой версии файла ' + `${path}/${dirent.name}`);
                    }
                } else {
                    console.log(`началось сжатие файла \`${path}/${dirent.name}\``);
                    await do_gzip(`${path}/${dirent.name}`, `${path}/${dirent.name}.gz`);
                    console.log(`закончилось сжатие файла \`${path}/${dirent.name}\``)
                }
            }
        } catch (err) {
            console.error(err);
        }

    }
    await dir.close();
    console.log(`закончилось сканирование директории ${path}`);

};

autoCompressor("../TestFolder");
