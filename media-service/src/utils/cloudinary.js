const cloudinary = require('cloudinary').v2;

const logger = require('./logger');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET

})

const uploadMediaToCloudinary = async (file) => {
    try{
   return new Promise ((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
        {
            resource_type: 'raw'
        },
        
        (error, result) => {
        if(result){
            resolve(result);
        }else{
            reject(error);
        }
    });

    uploadStream.end(file.buffer);  
   })

    }catch(err){
        logger.error(`Error uploading file to cloudinary: ${err.message}`);
        throw new Error(`Error uploading file to cloudinary: ${err.message}`);
    }
}
const deleteMediaFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'raw',
        });

        logger.info(`Media file deleted from cloud storage: ${JSON.stringify(result)}`);
        return result;
    } catch (err) {
        logger.error(`Error deleting file from cloudinary: ${err.message}`);
        throw new Error(`Error deleting file from cloudinary: ${err.message}`);
    }
};


module.exports =  { uploadMediaToCloudinary , deleteMediaFromCloudinary };