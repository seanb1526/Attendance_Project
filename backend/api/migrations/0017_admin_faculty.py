# Generated manually

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_admin'),
    ]

    operations = [
        migrations.AddField(
            model_name='admin',
            name='faculty',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='admin_profile', to='api.faculty'),
        ),
        migrations.AlterField(
            model_name='admin',
            name='role',
            field=models.CharField(choices=[('master', 'Master Admin'), ('co', 'Co-Administrator'), ('sub', 'University Admin'), ('revoked', 'Revoked')], default='sub', max_length=10),
        ),
    ]
