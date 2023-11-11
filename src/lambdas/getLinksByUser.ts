import { APIGatewayEvent } from "aws-lambda";
import { linkService } from "../services/linkService";

export const handler = async (event: APIGatewayEvent) => {
    const userId = event.requestContext.authorizer!.principalId;

    try {
        const links = await linkService.getLinksByUser(userId);
        return {
            statusCode: 200,
            body: JSON.stringify(links),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};
