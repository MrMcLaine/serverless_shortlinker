import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
import { linkService } from "../services/linkService";
import { handleError } from "../handlers/handleError";

export const getLinkFromShortUrl = async (
    event: APIGatewayEvent,
    context: Context,
    callback: Callback
) => {
    try {
        const linkId = event.pathParameters!.linkId?.toString();

        if (!linkId) {
            return callback(null, { statusCode: 400, body: 'Link ID is required' });
        }

        const link = await linkService.getLinkFromShortUrl(linkId);

        if (!link) {
            return callback(null, { statusCode: 404, body: 'Link not found' });
        }

        callback(null, { statusCode: 200, body: JSON.stringify(link) });
    } catch (error) {
        handleError(error);
    }
};
