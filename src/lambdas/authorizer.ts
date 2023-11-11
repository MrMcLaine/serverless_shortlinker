import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { authService } from "../services/AuthService";

export const handler = async (
    event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
    const token = event.authorizationToken;

    if (!token || !token.startsWith('Bearer ')) {
        throw new Error('Invalid token');
    }

    const trimmedToken = token.replace('Bearer ', '');

    try {
        const decoded = authService.getDataFromToken(trimmedToken);

        if (!decoded) {
            throw new Error('Token verification failed');
        }

        return generatePolicy(decoded.userId, 'Allow', event.methodArn);
    } catch (error) {
        console.log('error in authorizer', error);
        return generatePolicy('user', 'Deny', event.methodArn);
    }
};

const generatePolicy = (
    principalId: string,
    effect: string,
    resource: string
): APIGatewayAuthorizerResult  => {
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource,
                },
            ],
        },
    };
};
