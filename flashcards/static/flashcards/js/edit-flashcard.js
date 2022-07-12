import { showAlertSuccess } from './helpers.js';

export function editFlashcard(flashcard) {

    // Get card elements
    const question = flashcard.querySelector('.question');
    const answer = flashcard.querySelector('.answer');

    const editedQuestion = flashcard.querySelector('.edited-question');
    const editedAnswer = flashcard.querySelector('.edited-answer');

    const emptyEditedQuestion = flashcard.querySelector('.empty-edited-question');
    const emptyEditedAnswer = flashcard.querySelector('.empty-edited-answer');

    const questionTextarea = editedQuestion.querySelector('textarea');
    const answerTextarea = editedAnswer.querySelector('textarea');


    const editFlashcardBtnDiv = flashcard.querySelector('.edit-flashcard-btn-div');
    const saveFlashcardBtnDiv = flashcard.querySelector('.save-flashcard-btn-div');

    editFlashcardBtnDiv.classList.add('hidden');
    saveFlashcardBtnDiv.classList.remove('hidden');

    question.classList.add('hidden');
    answer.classList.add('hidden');

    // Clear error messages
    emptyEditedQuestion.innerText = '';
    emptyEditedAnswer.innerText = '';
    questionTextarea.classList.remove('empty-field');
    answerTextarea.classList.remove('empty-field');

    // Display textareas for editing
    questionTextarea.innerText = question.innerText;
    answerTextarea.innerText = answer.innerText;
    editedQuestion.classList.remove('hidden');
    editedAnswer.classList.remove('hidden');

    // Add event listener to Save button
    flashcard.querySelector('.save-flashcard-btn').addEventListener('click', () => {

        // Validate fields
        if (questionTextarea.value === '') {
            answerTextarea.classList.remove('empty-field');
            emptyEditedAnswer.classList.add('hidden');

            questionTextarea.classList.add('empty-field');
            emptyEditedQuestion.classList.remove('hidden');
            emptyEditedQuestion.classList.add('error-message');
            emptyEditedQuestion.innerText = 'Question can not be empty. Please specify question.';

        } else if (answerTextarea.value === '') {
            questionTextarea.classList.remove('empty-field');
            emptyEditedQuestion.classList.add('hidden');

            answerTextarea.classList.add('empty-field');
            emptyEditedAnswer.classList.remove('hidden');
            emptyEditedAnswer.classList.add('error-message');
            emptyEditedAnswer.innerText = 'Answer can not be empty. Please specify answer.';

        } else {

            fetch(`/edit-flashcard/${flashcard.dataset.id}`, {
                method: 'POST',
                body: JSON.stringify({
                    "question": questionTextarea.value,
                    "answer": answerTextarea.value,
                    "stack": document.querySelector('.form-group').dataset.stack
                })
            })
                .then(response => response.json())
                .then(data => {

                    editedQuestion.classList.add('hidden');
                    editedAnswer.classList.add('hidden');

                    editFlashcardBtnDiv.classList.remove('hidden');
                    saveFlashcardBtnDiv.classList.add('hidden');

                    question.classList.remove('hidden');
                    answer.classList.remove('hidden');

                    question.innerText = data.question;
                    answer.innerText = data.answer;

                    showAlertSuccess(flashcard, 'Flashcard was edited.');
                })
        }
    })
}