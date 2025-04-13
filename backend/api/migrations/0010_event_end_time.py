from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_attendance_device_id'),  # Update this to depend on the last migration
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='end_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
