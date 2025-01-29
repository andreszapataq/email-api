import type { NextApiRequest, NextApiResponse } from "next"
import { transporter, mailOptions } from "../../lib/nodemailer"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configurar headers CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001')
  res.setHeader('Access-Control-Allow-Methods', 'POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Manejar solicitud OPTIONS para preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

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

    // Agregar headers CORS también en la respuesta exitosa
    res.status(200).json({ message: "Email sent successfully" })
  } catch (error) {
    console.error("Error sending email:", error)
    // Agregar headers CORS también en la respuesta de error
    res.status(500).json({ error: "Error sending email" })
  }
}

