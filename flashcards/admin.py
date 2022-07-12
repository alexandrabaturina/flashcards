from django.contrib import admin
from .models import User, Category, Stack, Flashcard, Attempt

# Register your models here.
admin.site.register(User)
admin.site.register(Category)
admin.site.register(Stack)
admin.site.register(Flashcard)
admin.site.register(Attempt)
