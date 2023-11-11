import jwt from "jsonwebtoken";

interface Payload {
    userId: string;
}

class AuthService {
  generateToken(data: Payload): string {
    const payload = {
      userId: data.userId,
    };

    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "12h" });
  }

  getDataFromToken(token: string): Payload | null {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as Payload;
    } catch (err) {
      console.log("Error decoding token: ", err);

      return null;
    }
  }

  verifyToken(token: string): boolean {
    try {
      jwt.verify(token, process.env.JWT_SECRET!);

      return true;
    } catch (err) {
      console.log("Error verifying token: ", err);

      return false;
    }
  }
}

export const authService = new AuthService();
