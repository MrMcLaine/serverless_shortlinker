import { v4 as uuid } from 'uuid';
import { IUser } from '../interfaces/IUser';
import dynamoDb from '../libs/db';
import { createPasswordHash } from '../utils/passwordUtil';
import { authService } from './AuthService';

class UserService {
    async register(email: string, password: string): Promise<{ userId: string; token: string }> {
        const userId = uuid();
        const passwordHash = await createPasswordHash(password);
        const newUser: IUser = {
            userId,
            email,
            passwordHash,
        };

        const params = {
            TableName: process.env.USERS_TABLE!,
            Item: newUser,
        }


        await dynamoDb.put(params).promise();

        const token = await authService.generateToken({ userId });

        return { userId, token };
    }
}

export const userService = new UserService();