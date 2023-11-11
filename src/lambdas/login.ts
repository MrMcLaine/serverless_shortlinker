import { APIGatewayProxyHandler } from 'aws-lambda';
import { userService } from '../services/userService';
import { handleError } from "../handlers/handleError";

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        if (!event.body) throw new Error("Request body is empty");

        const { email, password } = JSON.parse(event.body);
        const { token } = await userService.login(email, password);

        return {
            statusCode: 200,
            body: JSON.stringify({ token }),
        };
    } catch (error) {
        return handleError(error);
    }
};
