from django.core.management.base import BaseCommand, CommandError
from django_redis import get_redis_connection


class Command(BaseCommand):
	help = "Flush all Redis keys using FLUSHALL."

	def handle(self, *args, **options):
		try:
			redis_client = get_redis_connection("default")
			redis_client.flushall()
		except Exception as exc:
			raise CommandError(f"Failed to flush Redis cache with FLUSHALL: {exc}") from exc

		self.stdout.write(
			self.style.SUCCESS(
				f"Redis FLUSHALL completed successfully."
			)
		)
