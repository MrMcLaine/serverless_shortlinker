import AWS from 'aws-sdk';
import jwt from 'jsonwebtoken';

const secretsManager = new AWS.SecretsManager();
let cachedSecret: string | undefined;

export interface Payload {
  userId: string;
}

const getSecret = async (): Promise<string> => {
  if (cachedSecret) return cachedSecret;

  const secretId = process.env.JWT_SECRET_ID  || 'default-secret-id';
  const data = await secretsManager.getSecretValue({ SecretId: secretId }).promise();
  if (!data.SecretString) {
    throw new Error('SecretString is undefined');
  }
  cachedSecret = JSON.parse(data.SecretString).jwt;
  if (!cachedSecret) {
    throw new Error('JWT is undefined in SecretString');
  }
  return cachedSecret;
};

class AuthService {
  async generateToken(data: Payload): Promise<string> {
    const payload = {
      userId: data.userId,
    };

    const secret = await getSecret();
    return jwt.sign(payload, secret, { expiresIn: '12h' });
  }

  async getDataFromToken(token: string): Promise<Payload | null> {
    try {
      const secret = await getSecret();
      return jwt.verify(token, secret) as Payload;
    } catch (err) {
      console.log('Error decoding token: ', err);
      return null;
    }
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const secret = await getSecret();
      jwt.verify(token, secret);
      return true;
    } catch (err) {
      console.log('Error verifying token: ', err);
      return false;
    }
  }
}

export const authService = new AuthService();
