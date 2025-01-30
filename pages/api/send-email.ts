import type { NextApiRequest, NextApiResponse } from "next"
import { transporter, mailOptions } from "../../lib/nodemailer"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configuración CORS consolidada
  const allowedOrigins = [
    'http://localhost:3001',
    'https://andreszapata.me'
  ];
  
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin')
     .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
     .setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).setHeader('Allow', ['POST'])
             .json({ error: `Método ${req.method} no permitido` });
  }

  // Validación mejorada
  const { name, email, message } = req.body;
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "Todos los campos son requeridos" });
  }

  try {
    // Objeto de correo simplificado
    const mailData = {
      ...mailOptions,
      from: `Formulario de Contacto <${process.env.EMAIL_SERVER_USER}>`,
      to: process.env.CONTACT_EMAIL,
      subject: `Nuevo mensaje de ${name} (${email})`,
      text: message,
      html: `<div>
        <h3>Nuevo mensaje del formulario</h3>
        <p><b>Nombre:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Mensaje:</b></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      </div>`
    };

    await transporter.sendMail(mailData);
    return res.status(200).json({ message: "Correo enviado exitosamente" });
    
  } catch (error) {
    console.error("Error enviando correo:", error);
    return res.status(500).json({ 
      error: "Error al enviar el correo",
      details: error instanceof Error ? error.message : "Error desconocido"
    });
  }
}

