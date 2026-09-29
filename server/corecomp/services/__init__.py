# determines if the services are mock or live

import os

from dotenv import load_dotenv
from pages.services import FinancialDataService, MockFinancialDataService

load_dotenv()
if os.getenv("MOCK") == "True":
    financial_data_service = MockFinancialDataService()
else:
    financial_data_service = FinancialDataService()
