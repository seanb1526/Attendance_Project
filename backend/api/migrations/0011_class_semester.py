# Generated by Django 5.0.2 on 2025-04-13 21:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_event_end_time'),
    ]

    operations = [
        migrations.AddField(
            model_name='class',
            name='semester',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
