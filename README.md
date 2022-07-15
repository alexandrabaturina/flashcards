# CS50w Capstone: Flashcards
## Overview
The current repo contains ***Flashcards*** app which is a website for creating flashcards and practicing with them.

This project is built as capstone for [CS50's Web Programming with Python and JavaScript](https://learning.edx.org/course/course-v1:HarvardX+CS50W+Web/home) course provided by edX platform.

***Flashcards*** app meets the following requirements:
* To be sufficiently distinct from the other projects in this course and more complex than those
  * Unlike other projects of this course, ***Flashcards*** allows users to download data from external files
  * ***Flashcards*** app provides data visualization using [d3 library](https://d3js.org/)
* To utilize Django (including at least one model) on the back-end
* To utilize JavaScript on the front-end
* To be mobile-responsive

Verify the deployment on an [Amazon EC2](https://aws.amazon.com/pm/ec2/?trk=36c6da98-7b20-48fa-8225-4784bced9843&sc_channel=ps&sc_campaign=acquisition&sc_medium=ACQ-P|PS-GO|Brand|Desktop|SU|Compute|EC2|US|EN|Text&s_kwcid=AL!4422!3!467723097970!e!!g!!amazon%20ec2&ef_id=CjwKCAjwoMSWBhAdEiwAVJ2ndpvWqiV2joPkKLlSlkk8fncn_1dQgN7BBFv4JGrMf2U25AHej3CPqxoCnoUQAvD_BwE:G:s&s_kwcid=AL!4422!3!467723097970!e!!g!!amazon%20ec2) instance with [Gunicorn](https://gunicorn.org/) and [Nginx](https://www.nginx.com/) [here](http://54.191.208.167/).

## Features
The ***Flashcards*** app allows users to:
* Create stacks and populate them with flashcards:
  * Created manually
  * Downloaded form properly formatted *csv* file
> To import flashcards from *csv* file, it has to use **semicolon (;)** as delimiter:
> ```
> question;answer
> ...
> ```
> Using **semicolon (;)** in question or answer is not allowed.
* Share stacks with other users
* Save stacks shared by other users for practicing
* Practice using flashcards
* View practice report after practicing each stack

![image](https://user-images.githubusercontent.com/53233637/118175392-e58bec80-b3e4-11eb-9b30-ea60f4928d14.png)

* Trace their progress
  * View up to 6 top practice categories on a donut chart
  * For each practiced stack, view bar chart along with the following data:
    * Total number of attempts
    * Average time spent
    * Average percentage of correct answers

![image](https://user-images.githubusercontent.com/53233637/118175234-b2495d80-b3e4-11eb-83a7-98fa46b2449b.png)

## Repo Contents
```
capstone/
  __init__.py
  asgi.py                  # ASGI config for capstone project
  settings.py              # Django settings for capstone project
  urls.py                  # capstone URL configuration
  wsgi.py                  # WSGI config for capstone project
flashcards/
  migrations/              # applicable migrations
    __init__.py
    ...
  static/
    flashcards/
      js/                  # project-related JavaScript files
        all-stacks.js
        ...
        user-stacks.js
      css/                 # project-related css files
        home.css
        ...
        styles.css
   templates/              # project-related html templates
      flashcards/
        all-stacks.html
        ...
        user-stacks.html
    __init__.py    
    admin.py               # file containing registered models
    apps.py                # file to register project-related apps
    models.py              # file containing models
    tests.py               # file to create tests
    views.py               # file containing views
  db.sqlite3               # application database
  manage.py                # Django command-line utility for administrative tasks
  
test.csv                   # properly formatted csv file to test downloading flashcards from file
```
## Dependencies
The ***Flaschcards*** app is built using Django framework. To install *Django* via terminal, use the following command.
```sh
$ pip3 install Django
```
### Dev Dependencies
To visualize user progress, [d3 library](https://d3js.org/) is used.
## Getting Started
### Running Locally
To run ***Flashcards*** locally,
1. Clone this repo.
2. ```cd``` into project directory.
3. Start the *Django* web server using the following command:
```sh
$ python manage.py runserver
```
4. Access ```127.0.0.1:8000``` in your browser.
### Resetting Database
The repo contains test database. To reset database,
1. Delete *db.sqlite3* file.
2. Run the following command:
```sh
$ python manage.py flush
```

## Deployment
The ***Flashcards*** app is deployed on an [Amazon EC2](https://aws.amazon.com/pm/ec2/?trk=36c6da98-7b20-48fa-8225-4784bced9843&sc_channel=ps&sc_campaign=acquisition&sc_medium=ACQ-P|PS-GO|Brand|Desktop|SU|Compute|EC2|US|EN|Text&s_kwcid=AL!4422!3!467723097970!e!!g!!amazon%20ec2&ef_id=CjwKCAjwoMSWBhAdEiwAVJ2ndpvWqiV2joPkKLlSlkk8fncn_1dQgN7BBFv4JGrMf2U25AHej3CPqxoCnoUQAvD_BwE:G:s&s_kwcid=AL!4422!3!467723097970!e!!g!!amazon%20ec2) instance with [Gunicorn](https://gunicorn.org/), [Nginx](https://www.nginx.com/), and [Supervisor](http://supervisord.org/). Verify the deployment [here](http://54.191.208.167/).

Amazon EC2 instance has the following characteristics:
* Platform: Ubuntu 20.04.4
* Public IPv4 address: ```54.191.208.167```

### Gunicorn Configuration
Gunicorn configuration is stored in ```/etc/supervisor/conf.d/gunicorn.conf``` file.
```
[program:gunicorn]
directory = /home/ubuntu/deploy-flashcards
command = /home/ubuntu/env/bin/gunicorn --workers 3 --bind unix:/home/ubuntu/de>
autostart = true
autorestart = true
stderr_logfile = /var/log/gunicorn/gunicorn.err.log
stdout_logfile = /var/log/gunicorn/gunicorn.out.log

[group:guni]
programs:gunicorn
```

### Nginx Server Configuration
Nginx server configuration is stored in ```/etc/nginx/sites-available/default``` file.
```
# Default server configuration

server {
        listen 80 default_server;
        listen [::]:80 default_server;
        server_name 54.191.208.167;

        location / {
                include proxy_params;
                proxy_pass http://unix:/home/ubuntu/deploy-flashcards/app.sock;
        }
        
        # Serving static content
        location /static/ {
                autoindex on;
                alias /home/ubuntu/deploy-flashcards/flashcards/static/;
        }
```

## Authors
Alexandra Baturina
