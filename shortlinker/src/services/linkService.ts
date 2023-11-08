import { v4 as uuid } from 'uuid';
import shortid from 'shortid';
import dynamoDb from '../libs/db';
import { ExpiryTerm } from '../contants/ExpiryTerm';
import { sqsService } from "./sqsService";
import { validateLink } from "../validation/linkValidation";
import { calculateExpiryDate } from "../utils/calculateExpiryDate";
import { ILink } from "../interfaces/ILink";

class LinkService {
    async createLink(
        userId: string,
        originalUrl: string,
        expiryPeriod: ExpiryTerm
    ): Promise<ILink> {
        await validateLink(originalUrl, expiryPeriod);

        const linkId = uuid();
        const shortUrl = shortid.generate().substring(0, 6);
        const expiredAt = await calculateExpiryDate(expiryPeriod);
        const newLink: ILink = {
            linkId,
            originalUrl,
            shortUrl,
            userId,
            isActive: true,
            expiredAt,
            isOneTimeUse: expiryPeriod === ExpiryTerm.ONCE,
            transitionCount: 0
        };

        const params = {
            TableName: process.env.LINKS_TABLE!,
            Item: newLink,
        };

        await dynamoDb.put(params).promise();

        return newLink;
    }

    async deactivateLink(linkId: string): Promise<void> {

        const linkResult = await dynamoDb.get({
            TableName: process.env.LINKS_TABLE!,
            Key: { linkId }
        }).promise();
        const link = linkResult.Item;

        if (!link) {
            throw new Error('Link not found');
        }

        await dynamoDb.update({
            TableName: process.env.LINKS_TABLE!,
            Key: { linkId },
            UpdateExpression: 'set isActive = :val',
            ExpressionAttributeValues: {
                ':val': false
            }
        }).promise();

        const userResult = await dynamoDb.get({
            TableName: process.env.USERS_TABLE!,
            Key: { userId: link.userId }
        }).promise();

        const user = userResult.Item;

        if (!user) {
            throw new Error('User not found');
        }

        const sqsQueueName = 'EmailQueue';
        const sqsQueueUrl = `https://sqs.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_ACCOUNT_ID}/${sqsQueueName}`;

        const message = {
            to: user.email,
            subject: 'Your link has been deactivated',
            body: 'Your link with ID ' + linkId + ' has been deactivated.',
        };
        await sqsService.sendMessage(sqsQueueUrl, message);
    }

    async isOwnerOfLink(userId: string, linkId: string): Promise<undefined | boolean> {
        const params = {
            TableName: process.env.LINKS_TABLE!,
            Key: {
                linkId: linkId
            }
        };

        const result = await dynamoDb.get(params).promise();
        return result.Item && result.Item.userId === userId;
    }

    async getLinkFromShortUrl(linkId: string): Promise<ILink | null> {
        const params = {
            TableName: process.env.LINKS_TABLE!,
            Key: {
                linkId: linkId
            }
        };

        const result = await dynamoDb.get(params).promise();

        if (result.Item) {
            const link: ILink = result.Item as ILink;

            await dynamoDb.update({
                TableName: process.env.LINKS_TABLE!,
                Key: { linkId },
                UpdateExpression: 'set transitionCount = transitionCount + :val',
                ExpressionAttributeValues: {
                    ':val': 1
                },
            }).promise();

            if (link.isActive && link.isOneTimeUse) {
                await this.deactivateLink(linkId);
            }

            return link;
        }

        return null;
    }

    async autoDeactivateExpiredLinks(): Promise<void> {
        const currentTimestamp = new Date().toISOString();

        const params = {
            TableName: process.env.LINKS_TABLE!,
            FilterExpression: 'isActive = :val AND expiredAt <= :now',
            ExpressionAttributeValues: {
                ':val': true,
                ':now': currentTimestamp
            }
        };

        const result = await dynamoDb.query(params).promise();

        if (result.Items) {
            for (const link of result.Items) {
                if (new Date(link.expiredAt) <= new Date()) {
                    await this.deactivateLink(link.linkId);
                }
            }
        }
    }
}

export const linkService = new LinkService();