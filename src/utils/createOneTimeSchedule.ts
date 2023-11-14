import { EventBridgeClient, PutRuleCommand, PutTargetsCommand } from "@aws-sdk/client-eventbridge";

const eventBridgeClient = new EventBridgeClient(
    { region: process.env.AWS_REGION || 'us-east-1' } as any
)

export const createOneTimeSchedule = async (linkId: string, expirationDateTime: string): Promise<void> => {
    const ruleName = `deactivateLink-${linkId}`;
    const lambdaArn = `arn:aws:lambda:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:function:deactivateLink`;

    const putRuleCommand = new PutRuleCommand({
        Name: ruleName,
        ScheduleExpression: `at(${expirationDateTime})`,
        State: 'ENABLED',
        Description: 'One-time schedule for deactivating a link'
    });

    await eventBridgeClient.send(putRuleCommand);

    const putTargetsCommand = new PutTargetsCommand({
        Rule: ruleName,
        Targets: [
            {
                Id: '1',
                Arn: lambdaArn,
                Input: JSON.stringify({ pathParameters: { linkId } }),
            }
        ]
    });

    await eventBridgeClient.send(putTargetsCommand);
}
