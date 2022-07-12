"""capstone URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib.auth import views
from django.contrib import admin
from django.urls import path
from flashcards import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("progress", views.show_user_progress, name="progress"),
    path("toggle-archived-flag/<int:stack_id>", views.toggle_archived_flag, name="toggle-archived-flag"),
    path("archive", views.show_archive, name="archive"),
    path("my-stacks", views.show_user_stacks, name="user-stacks"),
    path("all-stacks", views.show_all_stacks, name="all-stacks"),
    path("categories/<int:category_id>", views.show_category, name="category"),
    path("saved-stacks", views.show_saved_stacks, name="saved-stacks"),
    path("new-stack", views.create_new_stack, name="new-stack"),
    path("edit-stack/<int:stack_id>", views.edit_stack, name="edit-stack"),
    path("delete-stack/<int:stack_id>", views.delete_stack, name="delete-stack"),
    path("share-stack/<int:stack_id>", views.share_stack, name="share-stack"),
    path("save-stack/<int:stack_id>", views.save_stack, name="save-stack"),
    path("stacks/<int:stack_id>", views.show_stack, name="stack"),
    path("create-flashcard", views.create_flashcard, name="create-flashcard"),
    path("edit-flashcard/<int:flashcard_id>", views.edit_flashcard, name="edit-flashcard"),
    path("delete-flashcard/<int:flashcard_id>", views.delete_flashcard, name="delete-flashcard"),
    path("get-flashcards/<int:stack_id>", views.get_flashcards, name="get-flashcards"),
    path("practice/<int:stack_id>", views.practice, name="practice"),
    path("save-attempt/<int:stack_id>", views.save_attempt, name="save-attempt"),
    path("get-categories", views.get_categories, name="get-categories"),
    path("get-data-to-visualize-stacks/<int:stack_id>", views.get_data_to_visualize_stacks, name="visualize-stacks")
]
