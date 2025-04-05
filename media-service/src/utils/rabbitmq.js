const ampq = require('amqplib');
const logger = require('./logger'); 


let channel = null;
let connection = null;
// const QUEUE_NAME = 'post-service-queue';
const EXCHANGE_NAME = 'connectMe-event';
// const EXCHANGE_TYPE = 'topic';
// const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

async function connectToRabbitMQ() {
    try{
        connection = await ampq.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
        logger.info('Connected to RabbitMQ');
        return channel;

    }catch (error) {
        logger.error('Error connecting to RabbitMQ:', error);
        throw error;
    }

}

async function publishEvent(routingKey, message) {
    try{
        if (!channel) {
            await connectToRabbitMQ();
        
        }
        const msg = JSON.stringify(message);
        await channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(msg), {
            persistent: true,
            contentType: 'application/json',
        });
        logger.info(`Event published with routing key: ${routingKey}`);
    }catch (error) {
        logger.error('Error publishing event:', error);
        throw error;
    }
}


async function consumeEvent(routingKey, callback) {
    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
    logger.info(`Waiting for messages in queue: ${q.queue}`);

    channel.consume(
        q.queue,
        (msg) => {
            if (msg !== null) {
                logger.info(`Received message: ${msg.content.toString()}`);
                const content = JSON.parse(msg.content.toString());

                if (typeof callback === 'function') {
                    try {
                        callback(content);
                    } catch (error) {
                        logger.error(`Error in callback for ${routingKey}: ${error.message}`);
                    }
                } else {
                    logger.error(`Invalid callback provided for routing key: ${routingKey}`);
                }

                channel.ack(msg);
            }
        },
        { noAck: false }
    );

    logger.info(`Subscribed to event: ${routingKey}`);
}


module.exports = {
    connectToRabbitMQ,
    consumeEvent,
    publishEvent,
};