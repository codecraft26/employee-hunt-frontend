import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.body;
  console.log("FCM Token received:", token);

  // TODO: Save token to DB or forward to backend
  res.status(200).json({ success: true });
}