import * as AWS from 'aws-sdk';

const sqs = new AWS.SQS({ region: process.env.AWS_REGION });

class SQSService {
    async sendMessage(queueUrl, messageBody) {
        const params = {
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(messageBody),
        };
        await sqs.sendMessage(params).promise();
    }
}

export const sqsService = new SQSService();
