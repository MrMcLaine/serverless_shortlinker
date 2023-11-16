import { linkService } from '../services/linkService';

interface LinkDeactivationEvent {
    linkId: string;
}

export const handler = async (event: LinkDeactivationEvent) => {
    try {
        const { linkId } = event;
        await linkService.deactivateLink(linkId);

        return {
            statusCode: 200,
            body: `Link with id ${linkId} was successfully deactivate`
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};