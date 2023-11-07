import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
import { linkService } from "../services/linkService";
import { handleError } from "../handlers/handleError";

export const createLink = async (
    event: APIGatewayEvent,
    context: Context,
    callback: Callback
) => {
    try {
        const userId = event.requestContext.authorizer?.userId;

        if (!userId) {
            throw new Error('User ID not found in context');
        }

        const { originalUrl, expiryPeriod } = JSON.parse(event.body || '{}');

       const { shortUrl } = await linkService.createLink(userId, originalUrl, expiryPeriod);

       const response = {
            statusCode: 200,
            body: JSON.stringify(shortUrl),
       };

        callback(null, response);
    } catch (error) {
        handleError(error)
    }
};