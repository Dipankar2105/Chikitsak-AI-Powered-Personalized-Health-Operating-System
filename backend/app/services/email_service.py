"""
Email service for sending transactional emails via MailBluster.
"""
import httpx
import logging
from typing import Optional
from backend.app.config import settings

logger = logging.getLogger(__name__)


class MailBlusterEmailService:
    """
    Email service using MailBluster SMTP/API.
    Docs: https://mailbluster.com/docs
    """

    def __init__(self):
        self.api_key = settings.mailbluster_api_key
        self.api_url = "https://api.mailbluster.com/api"
        self.from_email = settings.email_from_address
        self.from_name = settings.email_from_name

    async def send_password_reset_email(
        self, to_email: str, reset_link: str, user_name: Optional[str] = None
    ) -> bool:
        """
        Send password reset email with token link.
        
        Args:
            to_email: Recipient email
            reset_link: Full reset URL (e.g., https://app.com/reset-password?token=xyz)
            user_name: Optional user name for personalization
            
        Returns:
            bool: True if sent successfully
        """
        try:
            subject = "Reset Your Chikitsak Password"
            
            # HTML email template
            html_body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #007bff;">Password Reset Request</h2>
                    
                    <p>Hi {user_name or 'User'},</p>
                    
                    <p>We received a request to reset your Chikitsak password. If you didn't request this, please ignore this email.</p>
                    
                    <p>Click the button below to reset your password (valid for 1 hour):</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_link}" 
                           style="background-color: #007bff; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block; 
                                  font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 12px;">
                        Or paste this link in your browser:<br>
                        <code style="background: #f5f5f5; padding: 5px; border-radius: 3px;">{reset_link}</code>
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    
                    <p style="color: #999; font-size: 12px;">
                        <strong>Security note:</strong> This link will expire in 1 hour. 
                        Never share this link with anyone. Chikitsak support will never ask for your password.
                    </p>
                    
                    <p style="color: #999; font-size: 12px;">
                        © 2026 Chikitsak AI. All rights reserved.
                    </p>
                </div>
            </body>
            </html>
            """
            
            # Plain text fallback
            text_body = f"""
Password Reset Request

Hi {user_name or 'User'},

We received a request to reset your Chikitsak password. If you didn't request this, please ignore this email.

Click the link below to reset your password (valid for 1 hour):

{reset_link}

Security note: This link will expire in 1 hour. Never share this link with anyone.

© 2026 Chikitsak AI. All rights reserved.
            """
            
            # Send via MailBluster API
            payload = {
                "to": to_email,
                "subject": subject,
                "from": self.from_email,
                "from_name": self.from_name,
                "html": html_body,
                "text": text_body,
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/send",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    timeout=10.0,
                )
                
                if response.status_code in (200, 201):
                    logger.info(f"Password reset email sent to {to_email}")
                    return True
                else:
                    logger.error(
                        f"Failed to send password reset email to {to_email}. "
                        f"Status: {response.status_code}, Response: {response.text}"
                    )
                    return False
        except Exception as e:
            logger.error(f"Exception sending password reset email to {to_email}: {str(e)}")
            return False

    async def send_verification_email(self, to_email: str, verification_link: str) -> bool:
        """
        Send email verification link.
        
        Args:
            to_email: Recipient email
            verification_link: Full verification URL
            
        Returns:
            bool: True if sent successfully
        """
        try:
            subject = "Verify Your Chikitsak Email"
            
            html_body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #007bff;">Verify Your Email</h2>
                    
                    <p>Welcome to Chikitsak!</p>
                    
                    <p>Please verify your email address to complete your account setup:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{verification_link}" 
                           style="background-color: #28a745; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block; 
                                  font-weight: bold;">
                            Verify Email
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 12px;">
                        Or paste this link: <code style="background: #f5f5f5; padding: 5px;">{verification_link}</code>
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    
                    <p style="color: #999; font-size: 12px;">
                        © 2026 Chikitsak AI. All rights reserved.
                    </p>
                </div>
            </body>
            </html>
            """
            
            text_body = f"""
Verify Your Email

Welcome to Chikitsak!

Please verify your email address by clicking this link:

{verification_link}

This link will expire in 24 hours.

© 2026 Chikitsak AI. All rights reserved.
            """
            
            payload = {
                "to": to_email,
                "subject": subject,
                "from": self.from_email,
                "from_name": self.from_name,
                "html": html_body,
                "text": text_body,
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/send",
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    timeout=10.0,
                )
                
                if response.status_code in (200, 201):
                    logger.info(f"Verification email sent to {to_email}")
                    return True
                else:
                    logger.error(
                        f"Failed to send verification email to {to_email}. "
                        f"Status: {response.status_code}"
                    )
                    return False
        except Exception as e:
            logger.error(f"Exception sending verification email: {str(e)}")
            return False


# Global instance
email_service = MailBlusterEmailService()
