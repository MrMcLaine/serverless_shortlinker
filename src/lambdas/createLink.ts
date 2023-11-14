import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
import { linkService } from "../services/linkService";
import { handleError } from "../handlers/handleError";
import {ExpiryTerm} from "../contants/ExpiryTerm";
import {createOneTimeSchedule} from "../utils/createOneTimeSchedule";

export const handler = async (
    event: APIGatewayEvent,
    context: Context,
    callback: Callback
) => {
    try {
        const userId = event.requestContext.authorizer?.principalId;
        const currentDomain = event.headers.Host;

        if (!userId) {
            throw new Error('User ID not found in context');
        }

        const { originalUrl, expiryPeriod } = JSON.parse(event.body || '{}');

        const newLink  = await linkService.createLink(userId, originalUrl, expiryPeriod);
        const fullShortUrl = `https://${currentDomain}/dev/${newLink.shortUrl}`;

        if (expiryPeriod !== ExpiryTerm.ONCE) {
            const expirationDateTime = newLink.expiredAt;
            await createOneTimeSchedule(newLink.linkId, expirationDateTime);
        }

       const response = {
            statusCode: 200,
            body: JSON.stringify(
                {
                    shortUrl: fullShortUrl,
                    expiredAt: newLink.expiredAt
                }),
       };

        callback(null, response);
    } catch (error) {
        handleError(error)
    }
};