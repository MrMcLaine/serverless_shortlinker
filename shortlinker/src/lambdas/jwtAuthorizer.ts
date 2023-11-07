import {
    APIGatewayTokenAuthorizerEvent,
    AuthResponse,
    PolicyDocument
} from "aws-lambda";
import { authService } from "../services/AuthService";

export const jwtAuthorizer = async (
    event: APIGatewayTokenAuthorizerEvent
): Promise<AuthResponse> => {
    const token = event.authorizationToken.replace(/^Bearer\s/, '');

    try {
        const decoded = await authService.getDataFromToken(token);
        if (!decoded) {
            throw new Error('Unauthorized');
        }

        const policyDocument: PolicyDocument = {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: 'Allow',
                    Resource: event.methodArn,
                },
            ],
        };

        return {
            principalId: decoded.userId,
            policyDocument,
            context: {
                userId: decoded.userId,
            },
        };
    } catch (err) {
        console.log(err);
        throw new Error('Unauthorized');
    }
};
