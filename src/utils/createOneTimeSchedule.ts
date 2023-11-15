import { EventBridgeClient, PutRuleCommand, PutTargetsCommand } from "@aws-sdk/client-eventbridge";

const eventBridgeClient = new EventBridgeClient(
    { region: process.env.AWS_REGION || 'us-east-1' } as any
)

export const createOneTimeSchedule = async (linkId: string, expirationDateTime: string): Promise<void> => {
    const ruleName = `deactivateLink-${linkId}`;
    const accountId = process.env.AWS_ACCOUNT_ID || '870642761716';
    const lambdaArn = `arn:aws:lambda:${process.env.AWS_REGION}:${accountId}:function:module-03-1-dev-deactivateLink`;

    const date = new Date(expirationDateTime);
    const cronExpression = `cron(${date.getUTCMinutes()} ${date.getUTCHours()} ${date.getUTCDate()} ${date.getUTCMonth() + 1} ? ${date.getUTCFullYear()})`;

    const putRuleCommand = new PutRuleCommand({
        Name: ruleName,
        ScheduleExpression: cronExpression,
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
