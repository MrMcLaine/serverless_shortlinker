import * as AWS from 'aws-sdk';

const sesRegion = process.env.AWS_REGION || 'eu-central-1';
const ses = new AWS.SES({ region: sesRegion });

class EmailService {
    async sendEmail(to: string, subject: string, body: string): Promise<void> {
        const senderEmail = process.env.SENDER_EMAIL;
        const params: AWS.SES.SendEmailRequest = {
            Source: senderEmail,
            Destination: {
                ToAddresses: [to]
            },
            Message: {
                Subject: { Data: subject },
                Body: {
                    Text: { Data: body }
                }
            }
        };

        try {
            await ses.sendEmail(params).promise();
            console.log('Email sent to', to);
        } catch (error) {
            console.error('Error sending email', error);
            throw error;
        }
    }
}

export const emailService = new EmailService();