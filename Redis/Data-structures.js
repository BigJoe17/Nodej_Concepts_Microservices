const redis = require('redis');

const client = redis.createClient({
    url: 'redis://localhost:6379'
});

client.on('error', (error) => console.log('Redis client error occurred!', error));

async function Datastructures() {
    try {
        await client.connect();

        // String-> datastructure setget  Mset and Mget 
        // single value 
        const Mname = await client.set('Name', 'Joshua');
        const getName = await client.get('Name');
        console.log(Mname);
        console.log(getName);

        // for multiple values
        await client.mSet(['user-name', 'John Smith', 'user-age', '58', 'user-email', 'jkosh@broski.com']);
        const [name, age, email] = await client.mGet(['user-name', 'user-age', 'user-email']);
        console.log(name, age, email);

        //list -> lPush, lPop, rPush, rPop, lRange, lTrim, lIndex, lRem
        await client.lPush('tasks', 'task1');
        await client.lPush('tasks', 'task2');
        await client.lPush('tasks', 'task3');
        await client.lPush('tasks', 'task4');
        await client.lPush('tasks', 'task5');
        const task = await client.lRange('tasks', 0, 1);
        console.log(task);

        // Hash -> hSet, hGet, hGetAll
        await client.hSet('user', 'name', 'Joshua');
        await client.hSet('user', 'age', '25');
        await client.hSet('user', 'email', 'Joshua@broski.com');
        const userName = await client.hGetAll('user',);
        console.log(JSON.stringify(userName));

        // Set -> sAdd, sMembers, sIsMember, sRem
        await client.sAdd('Frameworks', ['React', 'Vue', 'Angular', 'Svelte']);
        const frameworks = await client.sMembers('Frameworks');
        console.log(frameworks[0]);

        const extractedFramework = await client.sRem('Frameworks', ['Svelte', 'React']);
        console.log(extractedFramework);

        const isAFramework = await client.sIsMember('Frameworks', 'nodejs');
        console.log(isAFramework);

        const updatedFramework = await client.sMembers('Frameworks');
        console.log(updatedFramework);

        // Sorted Set -> zAdd, zRange, zRangeByScore, zRem
        await client.zAdd('scores', [
            { score: 3, value: 'John' },
            { score: 2, value: 'Doe' },
            { score: 1, value: 'Jane' },
            { score: 5, value: 'Smith' },
            { score: 4, value: 'Emily' }
        ]);
        const scores = await client.zRange('scores', 2, 4);
        console.log(scores);

        const scoreByRange = await client.zRangeByScore('scores', 0, 5);
        console.log(scoreByRange);

       const extractItemsWithScore = await client.zRangeByScoreWithScores('scores', 0, 9);
       console.log(extractItemsWithScore);

        const removedScore = await client.zRem('scores', ['John', 'Doe', 'Jane']);
        console.log(removedScore);

        // Hashes  -> hSet, hGet, hGetAll, hDel
        await client.hSet('user', {
            name: 'Joshua',
            age: '25',
            email: 'JoshuaOlugotun@gmail.com',
            location: 'Lagos'
        });
        const user = await client.hGetAll('user', ['name', 'age', 'email', 'location']);
        console.log((user));


    } catch (err) {
        console.log(err);
    } finally {
        await client.quit();
    }
}

Datastructures();