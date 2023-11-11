import { SQSEvent } from 'aws-lambda';
import { emailService } from '../services/emailService';

export const handler = async (event: SQSEvent) => {
    for (const record of event.Records) {
        const { linkId, userEmail } = JSON.parse(record.body);

        await emailService.sendEmail(
            userEmail,
            'Your link has been deactivated',
            `Your link with ID ${linkId} has been deactivated`
        );
    }
};
