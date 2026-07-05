import ImageKit from '@imagekit/nodejs';


const imagekitClient = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY 
});



export async function uploadToImagekit(buffer: Buffer){


    const result = await imagekitClient.files.upload({
        file: buffer.toString('base64'),
        fileName: 'image.jpeg'
    });

    return result
}