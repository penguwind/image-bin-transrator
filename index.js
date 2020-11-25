const Influx = require('influx')
const fs = require('fs');
const { type } = require('os');

const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'jpeg_buffer_db',
    schema: [
        {
            measurement: 'jpeg_buffer',
            fields: {
                buffer: Influx.FieldType.STRING,
            },
            tags: [
            ]
        }
    ]
});

let all_filenames = fs.readdirSync('./jpeg_files',);
const filenames = [];
const jpeg_other_delete = () =>{
    for (let i = 0; i < all_filenames.length; i++){
        const result = all_filenames[i].includes('.jpg', '.JPG', '.jpeg', '.JPEG', '.jpe', '.jfif', '.pjpeg', '.pjp');
        if (result == true){
            filenames.push(all_filenames[i]);
        } else {
            console.log('Remove non-JPEG files from the list');
        }
    };
};
jpeg_other_delete();
console.log("result:" + filenames);

const file_buffer = () => {
    const buffers = [];
    for (let i = 0; i < filenames.length; i++) {
        let text = fs.readFileSync( './jpeg_files/' + filenames[i] );
        buffers.push(text)
    }
    return buffers;
}

var i = 0;
const save_buffers = async (buffers) =>{
    for (const buffer of buffers){
        // console.log(buffer[i]);
        // console.log(i + "秒");
        await influx.writeMeasurement('jpeg_buffer', [
            {
            fields: {
                buffer: buffer[i].toString('base64'),
            },
            },
        ])
        if(i == buffers.length) clearInterval(id);
        i++;
    }
};
const buffers = file_buffer();
var id = setInterval(save_buffers, 1000,[buffers]);

const gen_images = async () =>{
    const data = await influx.query('select * from jpeg_buffer')
    for (const [i, item] of Object.entries(data)){
        if (typeof item.buffer === 'undefined'){
            continue
        };
        fs.writeFileSync(i + ".jpeg", Buffer.from(item.buffer, 'base64'));
        console.log("DONE");
    }
};

gen_images();