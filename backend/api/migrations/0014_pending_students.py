from django.db import migrations, models
import django.db.models.deletion
import uuid

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_class_semester'),  # Fix the parent migration reference to point to the last actual migration
    ]

    operations = [
        migrations.CreateModel(
            name='PendingStudent',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('student_id', models.CharField(max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('school', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.school')),
                ('added_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.faculty')),
            ],
            options={
                'unique_together': {('school', 'student_id')},
            },
        ),
        migrations.AddField(
            model_name='classstudent',
            name='pending_student',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.pendingstudent'),
        ),
        migrations.AlterField(
            model_name='classstudent',
            name='student',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.student'),
        ),
        migrations.AlterUniqueTogether(
            name='classstudent',
            unique_together={('class_instance', 'student'), ('class_instance', 'pending_student')},
        ),
        migrations.AddConstraint(
            model_name='classstudent',
            constraint=models.CheckConstraint(check=models.Q(models.Q(('student__isnull', False), ('pending_student__isnull', True)), models.Q(('student__isnull', True), ('pending_student__isnull', False)), _connector='OR'), name='one_student_type_only'),
        ),
    ]
