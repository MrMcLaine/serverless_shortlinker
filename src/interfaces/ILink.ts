export interface ILink {
    linkId: string;
    originalUrl: string;
    shortUrl: string;
    userId: string;
    isActive: boolean;
    expiredAt: string;
    isOneTimeUse: boolean;
    transitionCount: number;
    deactivateLetter: boolean
}