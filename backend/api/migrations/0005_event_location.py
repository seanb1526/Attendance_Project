# Generated by Django 5.0.2 on 2025-03-31 16:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_student_email_verified'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='location',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
