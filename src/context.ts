import { PrismaClient } from '@prisma/client';
import {PubSub} from "graphql-subscriptions";

const prisma = new PrismaClient();
const pubSub = new PubSub();

export interface Context {
    prisma: PrismaClient
    pubSub: PubSub
    req: any
    res: any
}

export function createContext(req: any, res: any) {
    return {
        ...req,
        ...res,
        pubSub,
        prisma
    }
}