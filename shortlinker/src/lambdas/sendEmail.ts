import { SQSEvent } from 'aws-lambda';
import { emailService } from '../services/emailService';

export const sendEmail = async (event: SQSEvent): Promise<void> => {
    try {
        for (const record of event.Records) {
            const messageBody = JSON.parse(record.body);

            const { to, subject, body } = messageBody;

            await emailService.sendEmail(to, subject, body);
        }
    } catch (error) {
        console.error('Error processing SQS event', error);
        throw error;
    }
};
