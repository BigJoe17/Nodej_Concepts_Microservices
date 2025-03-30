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
            resource_type: 'auto'
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

module.exports =  { uploadMediaToCloudinary };