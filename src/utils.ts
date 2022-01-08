import {Context} from "./context";
import {verify} from "jsonwebtoken";

export const APP_SECRET = 'appsecret'

interface Token {
    userId: string
}

export function getUserId(context: Context) {
    let authHeader;
    if (context.req.get('Authorization')) {
        authHeader = context.req.get('Authorization');
    } else {
        authHeader = context.req.cookies.token
    }
    if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const verified = verify(token, APP_SECRET) as Token;
        return verified.userId;
    }
}