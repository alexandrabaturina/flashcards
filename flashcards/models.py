from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    pass


class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.title}"


class Stack(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    archived = models.BooleanField(default=False)
    shared = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, related_name="created_by", on_delete=models.PROTECT)

    def __str__(self):
        return (f"{self.title} (id: {self.id}, category: {self.category.title}, created by {self.user.username})")


class Flashcard(models.Model):
    stack = models.ForeignKey(Stack, on_delete=models.CASCADE)
    question = models.TextField(blank=True)
    answer = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (f"Flashcard {self.id} from stack {self.stack.title}")


class Attempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stack = models.ForeignKey(Stack, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    time_spent = models.IntegerField(blank=False, null=False)
    number_of_questions = models.IntegerField(blank=False, null=False)
    correct_answers = models.IntegerField(blank=False, null=False)

    def __str__(self):
        return (f"Attempt {self.id} of user {self.user.username} for stack {self.stack.title}")
