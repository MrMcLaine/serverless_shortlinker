import { v4 as uuid } from 'uuid';
import shortid from 'shortid';
import dynamoDb from '../libs/db';
import { ExpiryTerm } from '../contants/ExpiryTerm';
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
            isOneTimeUse: expiryPeriod === ExpiryTerm.ONCE
        };

        const params = {
            TableName: process.env.LINKS_TABLE!,
            Item: newLink,
        };

        await dynamoDb.put(params).promise();

        return newLink;
    }

    async deactivateLink(linkId: string): Promise<void> {
        const params = {
            TableName: process.env.LINKS_TABLE!,
            Key: { linkId },
            UpdateExpression: 'set isActive = :val',
            ExpressionAttributeValues: {
                ':val': false
            }
        };

        await dynamoDb.update(params).promise();
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

            if (link.isActive && link.isOneTimeUse) {
                await this.deactivateLink(linkId);
            }

            return link;
        }

        return null;
    }
}

export const linkService = new LinkService();