from django.shortcuts import render
from django.db import IntegrityError
from django.shortcuts import redirect
from django.urls import reverse
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.http import JsonResponse
from datetime import datetime
from django.core import serializers
import json
import hashlib

from .models import User, Category, Flashcard, Stack, Attempt

STACKS_PER_PAGE = 10

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "flashcards/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "flashcards/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "flashcards/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "flashcards/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "flashcards/register.html")


def index(request):
    # Display categories of shared stacks
    stacks = Stack.objects.filter(shared=True)
    categories = []
    for stack in stacks:
        if stack.category not in categories:
            categories.append(stack.category)
    return render(request, "flashcards/index.html", {
        "categories": categories
    })

def add_pagination(request, stacks):
    """Return stacks for current page."""
    paginator = Paginator(stacks, STACKS_PER_PAGE)
    current_page = request.GET.get('page')
    return paginator.get_page(current_page)


def show_category(request, category_id):
    category = Category.objects.get(id=category_id)
    stacks = Stack.objects.filter(category_id=category_id).filter(
        shared=True).order_by('-timestamp')
    page_stacks = add_pagination(request, stacks)
    show_pagination = stacks.count() > STACKS_PER_PAGE
    return render(request, "flashcards/category.html", {
        "category": category,
        "page_stacks": page_stacks,
        "show_pagination": show_pagination
    })


def show_all_stacks(request):
    all_stacks =  Stack.objects.filter(shared=True).order_by('-timestamp')
    page_stacks = add_pagination(request, all_stacks)
    show_pagination = all_stacks.count() > STACKS_PER_PAGE
    return render(request, "flashcards/all-stacks.html", {
        "user": request.user,
        "page_stacks": page_stacks,
        "show_pagination": show_pagination
    })


def show_stack(request, stack_id):
    if request.method == "POST":
        # Check file extension
        file_extension = str(request.FILES["csv-file"]).rsplit('.')[1]
        if file_extension.lower() != 'csv':
            flashcards = Flashcard.objects.filter(stack=stack_id).order_by('-timestamp')
            stack = Stack.objects.get(id=stack_id)
            return render(request, "flashcards/stack.html", {
                "stack": stack,
                "flashcards": flashcards,
                "error_file_extension": True,
                "user": request.user
            })

        try:
            # Get the uploaded file content
            csv_file = request.FILES["csv-file"].read().decode()
            file_content = csv_file.splitlines()

            for line in file_content:
                (question, answer) = line.split(';')
                # Save flashcard to database
                stack = Stack.objects.get(id=stack_id)
                flashcard = Flashcard.objects.create(
                                                    question=question,
                                                    answer=answer,
                                                    stack=stack,
                                                    timestamp=datetime.now())
                flashcard.save()
            return HttpResponseRedirect(request.path_info)

        except:
            flashcards = Flashcard.objects.filter(stack=stack_id).order_by('-timestamp')
            stack = Stack.objects.get(id=stack_id)
            return render(request, "flashcards/stack.html", {
                "stack": stack,
                "flashcards": flashcards,
                "error_reading_csv": True
            })

    flashcards = Flashcard.objects.filter(stack=stack_id).order_by('-timestamp')
    stack = Stack.objects.get(id=stack_id)
    return render(request, "flashcards/stack.html", {
        "stack": stack,
        "flashcards": flashcards,
        "error_reading_csv": False
    })



def create_category(title, user):
    category = Category.objects.create(title=title, user=user)
    category.save()
    return category


def create_stack(category, title, user, archived, timestamp, shared, created_by):
    new_stack = Stack.objects.create(
                                    category=category,
                                    title=title,
                                    user=user,
                                    archived=archived,
                                    timestamp=timestamp,
                                    shared=shared,
                                    created_by=created_by)
    new_stack.save()
    return new_stack


@csrf_exempt
def create_new_stack(request):

    data = json.loads(request.body.decode("utf-8"))

    for category in Category.objects.all():
        if data["category"].lower() == category.title.lower():
            new_stack = create_stack(
                                    category,
                                    data["title"],
                                    request.user,
                                    False,
                                    datetime.now(),
                                    False,
                                    request.user
            )
            return JsonResponse({'stack_id': new_stack.id})



    new_category = create_category(data["category"], request.user)
    new_stack = create_stack(
                            new_category,
                            data["title"],
                            request.user,
                            False,
                            datetime.now(),
                            False,
                            request.user
    )

    return JsonResponse({'stack_id': new_stack.id})

@csrf_exempt
def edit_stack(request, stack_id):
    data = json.loads(request.body.decode("utf-8"))

    # Get stack
    stack = Stack.objects.get(id=stack_id)

    # Update title
    stack.title = data["title"]
    stack.save()

    return JsonResponse({
        'title': stack.title
    })

@csrf_exempt
def create_flashcard(request):
    data = json.loads(request.body.decode("utf-8"))
    # Get current stack
    current_stack = Stack.objects.get(id=data["stack"])

    # Save flashcard to database
    flashcard = Flashcard.objects.create(
                                        question=data["question"],
                                        answer=data["answer"],
                                        stack=current_stack,
                                        timestamp=datetime.now())
    flashcard.save()

    return JsonResponse({
        'id': flashcard.id,
        'question': flashcard.question,
        'answer': flashcard.answer
    })

@csrf_exempt
def edit_flashcard(request, flashcard_id):
    data = json.loads(request.body.decode("utf-8"))
    # Get current flashcard
    flashcard = Flashcard.objects.get(id=flashcard_id)
    flashcard.question = data["question"]
    flashcard.answer = data["answer"]
    timestamp = datetime.now()
    flashcard.save()

    return JsonResponse({
        'flashcard_id': flashcard.id,
        'question': flashcard.question,
        'answer': flashcard.answer
    })

@csrf_exempt
def delete_flashcard(request, flashcard_id):
    """
    Deletes flashcard with flashcard_id from database.
    """
    Flashcard.objects.get(pk=flashcard_id).delete()
    return HttpResponse(status=204)

@csrf_exempt
def toggle_archived_flag(request, stack_id):
    stack = Stack.objects.get(pk=stack_id)
    stack.archived=False if stack.archived == True else True
    stack.save()
    return HttpResponse(status=204)

@csrf_exempt
def share_stack(request, stack_id):
    stack = Stack.objects.get(pk=stack_id)
    stack.shared=True
    stack.save()
    return HttpResponse(status=204)


@csrf_exempt
def delete_stack(request, stack_id):
    Stack.objects.get(pk=stack_id).delete()
    return HttpResponse(status=204)


def show_archive(request):
    archived_stacks = Stack.objects.filter(user_id=request.user.id, archived=True)
    page_stacks = add_pagination(request, archived_stacks)
    show_pagination = archived_stacks.count() > STACKS_PER_PAGE
    return render(request, "flashcards/archive.html", {
        "page_stacks": page_stacks,
        "show_pagination": show_pagination
    })


def show_user_stacks(request):
    user_stacks = Stack.objects.filter(
        user_id=request.user.id,
        created_by=request.user,
        archived=False).order_by('-timestamp')

    for stack in user_stacks:
        stack.size = len(Flashcard.objects.filter(stack=stack))

    user_categories = Category.objects.filter(user_id=request.user.id)

    page_stacks = add_pagination(request, user_stacks)
    show_pagination = user_stacks.count() > STACKS_PER_PAGE

    return render(request, "flashcards/user-stacks.html", {
        "user_categories": user_categories,
        "page_stacks": page_stacks,
        "show_pagination": show_pagination
    })


@csrf_exempt
def save_stack(request, stack_id):
    stack_to_save = Stack.objects.get(pk=stack_id)
    flashcards_to_transfer = Flashcard.objects.filter(stack=stack_id)
    user_created = stack_to_save.created_by_id
    new_stack = create_stack(
                stack_to_save.category,
                stack_to_save.title,
                request.user,
                False,
                datetime.now(),
                False,
                User.objects.get(pk=user_created))
    for flashcard in flashcards_to_transfer:
        Flashcard.objects.create(stack=new_stack, question=flashcard.question,
                                answer=flashcard.answer, timestamp=flashcard.timestamp)
    return HttpResponse(status=204)


def show_saved_stacks(request):
    stacks = Stack.objects.filter(user_id=request.user).exclude(
        created_by=request.user).order_by('-timestamp')

    for stack in stacks:
        stack.size = len(Flashcard.objects.filter(stack=stack))

    page_stacks = add_pagination(request, stacks)
    show_pagination = stacks.count() > STACKS_PER_PAGE
    return render(request, "flashcards/saved-stacks.html", {
        "stacks": stacks,
        "page_stacks": page_stacks,
        "show_pagination": show_pagination
    })


def practice(request, stack_id):
    stack = Stack.objects.get(pk=stack_id)
    return render(request, "flashcards/practice.html", {
        "stack": stack
    })


def get_flashcards(request, stack_id):
    flashcards = Flashcard.objects.filter(stack=stack_id)
    response = serializers.serialize('json', flashcards, fields=('question', 'answer'))

    return JsonResponse(response, safe=False)


def create_attempt(user, stack, timestamp, time_spent, number_of_questions, correct_answers):
    attempt = Attmpt.objects.create(
                                    user=user,
                                    stack=stack,
                                    timestamp=timestamp,
                                    time_spent=time_spent,
                                    number_of_questions=number_of_questions,
                                    correct_answers=correct_answers)
    attempt.save()
    return attempt

@csrf_exempt
def save_attempt(request, stack_id):
    data = json.loads(request.body.decode("utf-8"))
    stack = Stack.objects.get(pk=stack_id)

    attempt = Attempt.objects.create(
                                    user=request.user,
                                    stack=stack,
                                    timestamp=datetime.now(),
                                    time_spent=data["time"],
                                    number_of_questions=data["questions"],
                                    correct_answers=data["correct"])
    attempt.save()

    return HttpResponse(status=204)


def format_average_time(time):
    """
    Take time in ms and based on its value return its formatted value:
    - In seconds (float, rounded to 1 digit)
    - In minutes and seconds (integer)
    - In hours, minutes, and seconds (integer)
    """

    def int_sec(time):
        """ Take time in ms and return its integer value in seconds."""
        return round((time / 1000) % 60)

    def int_min(time):
        """ Take time in ms and return its integer value in minutes."""
        return round((time / (1000 * 60)) % 60)

    def int_hours(time):
        """ Take time in ms and return its integer value in hours."""
        return round((time / (1000 * 60 * 60) % 24))

    # Time in seconds
    if time < 60000:
        return f"{round((time / 1000) % 60, ndigits=1)} s"
    # Time in minutes and seconds
    elif 60000  < time < 3600000:
        return f"{int_min(time)} min {int_sec(time)} s"
    # Time in hours, minutes, and seconds
    else:
        return f"{int_hours(time)} h {int_min(time)} min {int_sec(time)} s"


def show_user_progress(request):
    stacks = Stack.objects.filter(user=request.user).order_by('-timestamp')
    user_has_practiced = False;

    for stack in stacks:
        stack.attempts = stack.attempt_set.all().order_by('-timestamp')

        total_time = 0
        correct_answers = 0

        for attempt in stack.attempts:
            total_time += attempt.time_spent
            correct_answers += attempt.correct_answers

        stack.attempts_total = len(stack.attempts)
        if stack.attempts_total > 0:
            user_has_practiced = True
            avg_time = total_time / stack.attempts_total

            if avg_time < 60000:
                stack.avg_time = f"{round((avg_time/1000)%60, ndigits=1)} s"

            if avg_time > 60000:
                stack.avg_time = f"{round((avg_time/(1000*60))%60)} min {round((avg_time/1000)%60)} s"

            stack.correct = round((correct_answers /
                (stack.attempts_total * attempt.number_of_questions) * 100),
                ndigits=1)

    return render(request, "flashcards/progress.html", {
        "stacks": stacks,
        "user_has_practiced": user_has_practiced
    })

def get_categories(request):
    attempts = Attempt.objects.filter(user=request.user)
    categories = []
    for attempt in attempts:
        attempt.category = attempt.stack.category
        categories.append(attempt.category)

    response = serializers.serialize('json', categories)

    return JsonResponse(response, safe=False)

def get_data_to_visualize_stacks(request, stack_id):
    # Show no more than 10 attempts
    last_attempts = Attempt.objects.filter(stack=stack_id, user=request.user).order_by('-id')[:10]
    attempts = reversed(last_attempts)

    response = serializers.serialize('json', attempts, fields=(
        'timestamp',
        'number_of_questions',
        'correct_answers',
        'time_spent'
    ))

    return JsonResponse(response, safe=False)
