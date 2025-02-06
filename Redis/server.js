const redis = require('redis')

const client = redis.createClient({
    host: 'localhost',
    port: 6379
})

// event listener

client.on('error', (error) => console.log('Redis client error occured!', error)
)

async function testRedisConnection() {
   
        await client.connect()
        console.log('connected to Redis');

        try{

            
            await client.set('key', 'value');
            const value = await client.get('key');
            console.log(value)

            await client.set('age', 30);
            const age = await client.get('age')

            const decrementCount = await client.decr('age');
            await client.decr('age');
            await client.decr('age');    
            await client.decr('age');   
            await client.decr('age');
            

            console.log(decrementCount)

            const incrementCount = await client.incr('age')
            console.log(incrementCount)
           
            let  updatedAge = await client.get('age');
            console.log(updatedAge)
            
        //set value
            await client.set('user-session:123','name')
            
            let userSession = await client.get('user-session:123');
            console.log(userSession);

            const extractUpdated = await client.get('key')
            console.log(extractUpdated)
        
            const deleteName = await client.del('')
            console.log(deleteName)


        }catch(err){
            console.error(err)
            console.log("Something went wrong!")
            
        }
        finally{
            await client.quit()

        }
       


 
}

testRedisConnection()
