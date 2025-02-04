const cors = require('cors');

const configureCors = ()=>{
    return cors ({
        //origin -> this  tells the origins users can access through your apis
        origin: (origin, callback) =>{
            const allowedOrigins =[
                'http://localhost:3000',
                'https://yourcustomdomain.com'
            ]
            if(!origin || allowedOrigins.indexOf(origin) !== -1){
                callback(null, true)
            }else{
                callback(new Error('Not allowed by cors'))
            }
        },

        methodS: ['GET','POST', 'PUT', 'DELETE'],
        allowedHeaders:[
            'Content-Type',
            'Authorization',
            'Accept-version'
        ],
        exposedHeaders: ['X-Total count', 'Content-Ramge'],
        credentials: true,
        preflightContinue: false,
        maxAge:600, // it preflight response for 10mins (600 secs)-> avoid sending options request multiple times
        optionsSuccessStatus: 204 // succesful options request
    })
}

module.exports ={configureCors}