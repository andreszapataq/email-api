import type { NextApiRequest, NextApiResponse } from "next"
import { transporter, mailOptions } from "../../lib/nodemailer"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { to, subject, text, html } = req.body

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  try {
    await transporter.sendMail({
      ...mailOptions,
      to,
      subject,
      text,
      html,
    })

    res.status(200).json({ message: "Email sent successfully" })
  } catch (error) {
    console.error("Error sending email:", error)
    res.status(500).json({ error: "Error sending email" })
  }
}

