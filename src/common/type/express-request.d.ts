declare global {
  namespace Express {
    interface Request {
      accessId?: string;
    }
  }
}

export {};
