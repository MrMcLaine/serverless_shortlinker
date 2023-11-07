import { handleError } from "../handlers/handleError";
import { linkService } from "../services/linkService";

export const cronJob = async (): Promise<void> => {
    try {
        await linkService.autoDeactivateExpiredLinks();
    } catch (error) {
        handleError(error);
    }
}