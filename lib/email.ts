import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBookingConfirmation(
  customerEmail: string,
  customerName: string,
  serviceName: string,
  appointmentDate: string,
  appointmentTime: string,
) {
  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [customerEmail],
      subject: "Booking Confirmation - haymi nail care",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f43f5e, #ec4899); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Nail Bliss Studio</h1>
            <p style="color: white; margin: 10px 0 0 0;">Luxury Nail Care</p>
          </div>
          
          <div style="padding: 30px; background: #fff;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Booking Confirmation</h2>
            
            <p>Dear ${customerName},</p>
            
            <p>Thank you for booking with Nail Bliss Studio! We're excited to pamper you.</p>
            
            <div style="background: #fef2f2; border-left: 4px solid #f43f5e; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1f2937;">Appointment Details</h3>
              <p style="margin: 5px 0;"><strong>Service:</strong> ${serviceName}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${appointmentTime}</p>
            </div>
            
            <p>Please arrive 10 minutes early for your appointment. If you need to reschedule, please call us at (555) 123-4567.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="tel:+15551234567" style="background: linear-gradient(135deg, #f43f5e, #ec4899); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Call Us</a>
            </div>
            
            <p>We can't wait to see you!</p>
            <p>The Nail Bliss Studio Team</p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>123 Beauty Lane, Salon District, NY 10001</p>
            <p>Phone: (555) 123-4567 | Email: hello@nailblissstudio.com</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending email:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

export async function sendAdminNotification(
  customerName: string,
  serviceName: string,
  appointmentDate: string,
  appointmentTime: string,
  customerEmail: string,
  customerPhone?: string,
) {
  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: ["negaamanuel387@gmail.com"],
      subject: "New Booking - Haymi Nail Care",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Booking Received</h2>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            ${customerPhone ? `<p><strong>Phone:</strong> ${customerPhone}</p>` : ""}
          </div>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Appointment Details</h3>
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointmentTime}</p>
          </div>
          
          <p>Please confirm this appointment with the customer.</p>
        </div>
      `,
    })

    return !error
  } catch (error) {
    console.error("Error sending admin notification:", error)
    return false
  }
}
