from dotenv import load_dotenv
import os
import requests


load_dotenv()

class EmailService:
    def send_email(self, email, subject, text):
        return requests.post(
            "https://api.mailgun.net/v3/corecomp.cc/messages",
            auth=("api", os.getenv("MAILGUN_API_KEY")),
            data={
                    "from": "CoreComp <no-reply@corecomp.cc>",
                    "to": f"customer <{email}>",
                    "subject": subject,
                    "text": text
            }
        )

        
class MockEmailService:
    def send_email(self, email, subject, text):
        return requests.post(
            "https://api.mailgun.net/v3/sandboxcb8d9093dd704fa990c67dc9fb3b0e78.mailgun.org/messages",
            auth=("api", os.getenv("MAILGUN_API_KEY")),
            data={
                "from": "CoreComp <postmaster@sandboxcb8d9093dd704fa990c67dc9fb3b0e78.mailgun.org>",
                "to": "Peter <sriphrakhunpiyawit@gmail.com>",
                "subject": subject,
                "text": text
            }
        )