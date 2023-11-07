import * as yup from 'yup';
import { ExpiryTerm } from "../contants/ExpiryTerm";
import { handleError } from "../handlers/handleError";

const linkSchema = yup.object().shape({
    originalUrl: yup.string().url().required(),
    expiryPeriod: yup.mixed().oneOf(Object.values(ExpiryTerm)).required(),
});

export async function validateLink(link: string, expiryPeriod: ExpiryTerm) {
    try{
        await linkSchema.validate(
            {
                originalUrl: link,
                expiryPeriod
            }
        );
    } catch (error) {
        if (error instanceof Error) {
            handleError(error.message);
        } else {
            handleError('An unknown error occurred');
        }
    }
}