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
 })

const filenames = fs.readdirSync('./jpeg_files',);
// console.log(filenames);

const file_buffer = () => {
    const buffers = [];
    for (let i = 0; i < filenames.length; i++) {
        let text = fs.readFileSync( './jpeg_files/' + filenames[i] );
        // console.log(filenames[i], text);
        buffers.push(text)
    }
    return buffers;
}

const save_buffers = async (buffers) =>{
    for (const buffer of buffers){
        await influx.writeMeasurement('jpeg_buffer', [
            {
            fields: {
                buffer: buffer.toString('base64'),
            },
            },
        ])
    }
}
const buffers = file_buffer();
// save_buffers(buffers);

const gen_images = async () =>{
    const data = await influx.query('select * from jpeg_buffer')
    // console.log(Object.keys(data[0]))
    for (const [i, item] of Object.entries(data)){
        if (typeof item.buffer === 'undefined'){
            continue
        }
        fs.writeFileSync(i + ".jpeg", Buffer.from(item.buffer, 'base64'))
        console.log(Object.keys(item))
    }
}

gen_images();