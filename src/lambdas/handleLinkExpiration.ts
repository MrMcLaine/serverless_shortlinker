import { DynamoDBStreamEvent } from 'aws-lambda';
import { SQS } from 'aws-sdk';

export const handler = async (event: DynamoDBStreamEvent) => {
    const sqs = new SQS();
    const queueUrl = process.env.LINK_DEACTIVATION_QUEUE_URL;

    if (!queueUrl) {
        console.error("Queue URL is not defined.");
        throw new Error("Queue URL is not defined in environment variables.");
    }

    for (const record of event.Records) {
        if (record.eventName === 'REMOVE' && record.dynamodb && record.dynamodb.Keys) {
            const linkId = record.dynamodb.Keys.linkId.S;

            if (linkId) {
                const params = {
                    MessageBody: JSON.stringify({ linkId }),
                    QueueUrl: queueUrl
                };

                await sqs.sendMessage(params).promise();
            }
        }
    }
};
