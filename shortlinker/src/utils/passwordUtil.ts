import bcrypt from "bcrypt";
import { handleError } from "../handlers/handleError";

const SALT = 5;

export const createPasswordHash = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT);

    return await bcrypt.hash(password, salt);
  } catch (error) {
    handleError(error);
    throw new Error("Failed to hash the password");
  }
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    handleError(error);
    throw new Error("Failed to compare the password");
  }
};
