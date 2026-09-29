import os

from dotenv import load_dotenv
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

load_dotenv()

def verify_google_token(jwt_token):
    user_info = id_token.verify_oauth2_token(jwt_token, google_requests.Request(), os.getenv("GOOGLE_CLIENT_ID"))
    return user_info
