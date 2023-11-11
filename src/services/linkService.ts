import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import shortid from 'shortid';
import dynamoDb from '../libs/db';
import { ExpiryTerm } from '../contants/ExpiryTerm';
import { validateLink } from "../validation/linkValidation";
import { calculateExpiryDate } from "../utils/calculateExpiryDate";
import { ILink } from "../interfaces/ILink";

const sqs = new AWS.SQS();

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
            transitionCount: 0,
            deactivateLetter: false
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

        if (!link.deactivateLetter) {
            const userResult = await dynamoDb.get({
                TableName: process.env.USERS_TABLE!,
                Key: { userId: link.userId }
            }).promise();

            const user = userResult.Item;

            if (!user) {
                throw new Error('User not found');
            }

            const params = {
                MessageBody: JSON.stringify({
                    linkId: link.linkId,
                    userEmail: user.email,
                    shortUrl: link.shortUrl
                }),
                QueueUrl: process.env.LINK_DEACTIVATION_QUEUE_URL!
            };

            await sqs.sendMessage(params).promise();
        }
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

    async getLinkFromShortUrl(shortUrl: string): Promise<string | null> {
        const params = {
            TableName: process.env.LINKS_TABLE!,
            IndexName: 'ShortUrlIndex',
            KeyConditionExpression: 'shortUrl = :shortUrl',
            ExpressionAttributeValues: {
                ':shortUrl': shortUrl,
            },
        };
        const result = await dynamoDb.query(params).promise();

        if (!result.Items) {
            return null;
        }

        if (result.Items && result.Items.length > 0) {
            const link: ILink = result.Items[0] as ILink;
            const linkId = link.linkId;

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

            return result.Items[0].originalUrl;
        }

        return null;
    }

    async getLinksByUser(userId: string): Promise<ILink[]> {
        const params = {
            TableName: process.env.LINKS_TABLE!,
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
        };

        try {
            const result = await dynamoDb.query(params).promise();
            console.log('result for getLinksBYUser', result);
            return result.Items as ILink[];
        } catch (error) {
            console.error('Error fetching links by user:', error);
            throw error;
        }
    }
}

export const linkService = new LinkService();
