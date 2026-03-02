from django.core.management.base import BaseCommand
from pages.models import Symbol
import requests
import io
from django.db import transaction
import csv
from dotenv import load_dotenv
import os


load_dotenv()

api_key = os.getenv("ALPHAVANTAGE_API_KEY")

class Command(BaseCommand):
    help = 'a command to update or create a Symbol model'

    def handle(self, *args, **options):
        url = 'https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=demo'
        response = requests.get(url)
        csv_text = response.text
        csv_stream = io.StringIO(csv_text)
        active_companies = csv.DictReader(csv_stream)

        url = f"https://www.alphavantage.co/query?function=LISTING_STATUS&state=delisted&apikey={api_key}"
        response = requests.get(url)
        csv_text = response.text
        csv_stream = io.StringIO(csv_text)
        delisted_companies = csv.DictReader(csv_stream)

        total_deletion = 0
        total_addition = 0

        # make sure to save only when every operations succeed and rollback if error occurs
        with transaction.atomic():
            # delisted companies
            for company in delisted_companies:
                symbol = company["symbol"].strip()
                record = Symbol.objects.filter(symbol=symbol).first()
                if record:
                    record.delete()
                    total_deletion += 1

            # active companies
            for company in active_companies:
                name = company["name"].strip()
                symbol = company["symbol"].strip()
                type = company["assetType"].strip()
                if type.upper() == "STOCK":
                    record, created = Symbol.objects.update_or_create(symbol=symbol, defaults={"name": name, "type": type})
                    if created:
                        total_addition += 1

        print(f"total deletion: {total_deletion}")
        print(f"total addition: {total_addition}")
