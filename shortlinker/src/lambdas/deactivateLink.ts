import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
import { linkService } from "../services/linkService";
import { handleError } from "../handlers/handleError";

export const deactivateLink = async (
    event: APIGatewayEvent,
    context: Context,
    callback: Callback
) => {
    try {
        const linkId = event.pathParameters!.linkId?.toString();
        const userId = event.requestContext.authorizer!.principalId;

        if (!linkId || !userId) {
            return callback(null, { statusCode: 400, body: 'Link ID and User ID are required' });
        }

        const isOwner = await linkService.isOwnerOfLink(userId, linkId);
        if (!isOwner) {
            return callback(null, { statusCode: 403, body: 'Unauthorized' });
        }

        await linkService.deactivateLink(linkId);
        callback(null, { statusCode: 200, body: 'Link deactivated successfully' });
    } catch (error) {
        handleError(error);
    }
};
