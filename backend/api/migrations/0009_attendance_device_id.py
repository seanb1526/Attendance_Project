# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_alter_attendance_location'),
    ]

    operations = [
        migrations.AddField(
            model_name='attendance',
            name='device_id',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
