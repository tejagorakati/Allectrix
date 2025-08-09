import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

export type JwtActor = {
  sub: string;
  role: 'user' | 'doctor' | 'admin' | 'emergency';
};

export function signToken(payload: JwtActor, expiresIn: string = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): JwtActor {
  return jwt.verify(token, JWT_SECRET) as JwtActor;
}