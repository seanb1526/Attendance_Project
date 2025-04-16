# Generated manually

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_remove_classstudent_one_student_type_only_and_more'),  # Adjust this based on your actual dependencies
    ]

    operations = [
        migrations.CreateModel(
            name='Admin',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('role', models.CharField(choices=[('master', 'Master Admin'), ('co', 'Co-Administrator'), ('sub', 'University Admin')], default='sub', max_length=10)),
                ('password_hash', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_login', models.DateTimeField(blank=True, null=True)),
                ('school', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.school')),
            ],
        ),
    ]
