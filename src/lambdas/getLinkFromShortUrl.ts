import { APIGatewayEvent } from 'aws-lambda';
import { linkService } from "../services/linkService";

export const handler = async (
    event: APIGatewayEvent
) => {
    try {
        const shortUrl = event.pathParameters!.linkId?.toString();

        if (!shortUrl) {
            return { statusCode: 400, body: 'Link ID is required' };
        }

        const originalUrl = await linkService.getLinkFromShortUrl(shortUrl);

        if (originalUrl) {
            return {
                statusCode: 301,
                headers: { Location: originalUrl }
            };
        } else {
            return { statusCode: 404, body: 'Link not found or inactive' };
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};
