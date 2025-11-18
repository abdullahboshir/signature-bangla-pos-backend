import jwt, {type JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';

export const createToken = (
  jwtPayload: { userId: Types.ObjectId; role: string },
  secret: string,
  expiresIn: any,
) => {
  return jwt.sign(jwtPayload, secret as string, {
    expiresIn,
  })
}

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload
}