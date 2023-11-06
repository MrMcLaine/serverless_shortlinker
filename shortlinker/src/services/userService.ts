import { v4 as uuid } from 'uuid';
import { IUser } from '../interfaces/IUser';
import dynamoDb from '../libs/db';
import {comparePassword, createPasswordHash} from '../utils/passwordUtil';
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

    async login(email: string, password: string): Promise<{ userId: string; token: string }> {
        const user = await this.getUserByEmail(email);

        if (!user) {
            throw new Error('User does not exist or wrong password.');
        }

        const passwordIsValid = await comparePassword(password, user.passwordHash);

        if (!passwordIsValid) {
            throw new Error('User does not exist or wrong password.');
        }

        const userId = user.userId;

        const token = await authService.generateToken({ userId: user.userId });
        return { userId, token };
    }

    private async getUserByEmail(email: string): Promise<IUser | null> {
        const params = {
            TableName: process.env.USERS_TABLE!,
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email,
            },
        };

        const result = await dynamoDb.query(params).promise();

        if (result.Items && result.Items.length > 0) {
            return result.Items[0] as IUser;
        }

        return null;
    }
}

export const userService = new UserService();