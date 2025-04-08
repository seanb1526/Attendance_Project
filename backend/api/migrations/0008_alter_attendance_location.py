# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_attendance_location'),
    ]

    operations = [
        migrations.AlterField(
            model_name='attendance',
            name='location',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
    ]
