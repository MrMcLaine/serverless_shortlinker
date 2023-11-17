import { SchedulerClient, CreateScheduleCommand, ScheduleState, FlexibleTimeWindowMode } from "@aws-sdk/client-scheduler";

const schedulerClient = new SchedulerClient({ region: process.env.AWS_REGION || 'us-east-1' } as any);

export const deactivate = async (linkId: string, expirationDateTime: string) => {
    const ruleName = `deactivateLink-${linkId}`;
    console.log('ruleName', ruleName);
    const accountId = process.env.AWS_ACCOUNT_ID || '870642761716';
    console.log('accountId', accountId);
    const lambdaArn = `arn:aws:lambda:${process.env.AWS_REGION}:${accountId}:function:module-03-1-dev-linkDeactivation`;
    console.log('lambdaArn', lambdaArn);
    const roleArn = `arn:aws:iam::${accountId}:role/LinkDeactivationLambdaRole`;
    console.log('roleArn', roleArn);

    const date = new Date(expirationDateTime);
    const cronExpression = `cron(${date.getUTCMinutes()} ${date.getUTCHours()} ${date.getUTCDate()} ${date.getUTCMonth() + 1} ? ${date.getUTCFullYear()})`;
    console.log('cronExpression', cronExpression);

    const input = {
        Name: ruleName,
        ScheduleExpression: cronExpression,
        Description: 'One-time schedule for deactivating a link',
        State: ScheduleState.ENABLED,
        Target: {
            Arn: lambdaArn,
            RoleArn: roleArn,
            Input: JSON.stringify({ linkId: linkId }),
        },
        FlexibleTimeWindow: {
            Mode: FlexibleTimeWindowMode.OFF,
        }
    };

    const command = new CreateScheduleCommand(input);

    try {
        const response = await schedulerClient.send(command);
        console.log('Schedule created:', response.ScheduleArn);
    } catch (error) {
        console.error('Error creating schedule:', error);
    }
};
