import os
import sys
import smtplib

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

ERROR_SENDER_EMAIL = os.getenv('ERROR_SENDER_EMAIL', 'noreply@2anki.net')
ERROR_RECEIVER_EMAIL = os.getenv('ERROR_RECEIVER_EMAIL', 'alexander@alemayhu.com')

def send_error_email(subject, error_message):
    """
    Send an error email with the given subject and message.
    
    Args:
        subject (str): The subject line of the email
        error_message (str): The error details to include in the email body
    """
    msg = MIMEMultipart()
    msg['From'] = ERROR_SENDER_EMAIL
    msg['To'] = ERROR_RECEIVER_EMAIL
    msg['Subject'] = subject
    msg.attach(MIMEText(error_message, 'plain'))

    try:
        with smtplib.SMTP('localhost') as server:
            server.send_message(msg)
    except smtplib.SMTPException as email_err:
        print(f"Failed to send error email: {email_err}", file=sys.stderr)