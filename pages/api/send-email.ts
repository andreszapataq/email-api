import type { NextApiRequest, NextApiResponse } from "next"
import { transporter, mailOptions } from "../../lib/nodemailer"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Lista blanca de orígenes permitidos
  const allowedOrigins = [
    'http://localhost:3001',
    'https://andreszapata.me'
  ];
  
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Manejar preflight inmediatamente
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Ahora verificar el método POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Método ${req.method} no permitido` })
  }

  const { name, email, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  try {
    await transporter.sendMail({
      ...mailOptions,
      from: `"Contact Form" <${process.env.EMAIL_SERVER_USER}>`,
      to: process.env.CONTACT_EMAIL,
      subject: `New message from ${name} (${email})`,
      text: message,
      html: `
        <div>
          <h3>New contact form submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
      `,
    })

    // Agregar headers CORS también en la respuesta exitosa
    res.status(200).json({ message: "Email sent successfully" })
  } catch (error) {
    console.error("Error sending email:", error)
    // Agregar headers CORS también en la respuesta de error
    res.status(500).json({ 
      error: "Error sending email",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
}

