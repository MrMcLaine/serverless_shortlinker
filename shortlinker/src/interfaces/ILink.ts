export interface ILink {
    linkId: string;
    originalUrl: string;
    shortUrl: string;
    userId: string;
    isActive: boolean;
    expiredAt: Date;
    isOneTimeUse: boolean;
}