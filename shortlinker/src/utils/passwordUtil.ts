import bcrypt from "bcrypt";

const SALT = 5;

export const createPasswordHash = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT);

    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error("Error hashing password:", error);
    return Promise.reject("Failed to hash the password");
  }
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return Promise.reject("Failed to compare the password");
  }
};
