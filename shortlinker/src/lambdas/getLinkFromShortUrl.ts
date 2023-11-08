import { APIGatewayEvent } from 'aws-lambda';
import { linkService } from "../services/linkService";
import { handleError } from "../handlers/handleError";

export const getLinkFromShortUrl = async (
    event: APIGatewayEvent,
) => {
    try {
        const linkId = event.pathParameters!.linkId?.toString();

        if (!linkId) {
            return { statusCode: 400, body: 'Link ID is required' };
        }

        const link = await linkService.getLinkFromShortUrl(linkId);

        if (link && link.isActive) {
            return {
                statusCode: 301,
                headers: { Location: link.originalUrl }
            };
        } else {
            return { statusCode: 404, body: 'Link not found or inactive' };
        }
    } catch (error) {
        handleError(error);
    }
};
