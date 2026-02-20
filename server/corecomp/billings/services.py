from dotenv import load_dotenv
import os
from .utils import checkout


load_dotenv()

class PaymentService:
    def checkout(self, user):
        # TODO: update when stripe is ready
        session = checkout(
            mode="subscription",
            line_items=[{"price": "price_1SN5QcLmRJ2Mkn9vd7R1eYYd", "quantity": 1}],
            ui_mode="embedded",
            return_url=f"{os.getenv('FRONTEND_BASE_URL')}/return/{{CHECKOUT_SESSION_ID}}",
            subscription_data = {
                "trial_period_days": 7,
                "metadata": {
                    "user_id": str(user.id),
                },
            }
        )
        return session

        
class MockPaymentService:
    def checkout(self, user):
        session = checkout(
            mode="subscription",
            line_items=[{"price": "price_1SN5QcLmRJ2Mkn9vd7R1eYYd", "quantity": 1}],
            ui_mode="embedded",
            return_url=f"{os.getenv('FRONTEND_BASE_URL')}/return/{{CHECKOUT_SESSION_ID}}",
            subscription_data = {
                "trial_period_days": 7,
                "metadata": {
                    "user_id": str(user.id),
                },
            }
        )
        return session
