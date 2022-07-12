import { editFlashcard } from './edit-flashcard.js';
import { deleteFlashcard } from './delete-flashcard.js';
import { showAlertSuccess } from './helpers.js';

export function createFlashcard() {

    const newQuestionTextarea = document.querySelector('#new-question');
    const newAnswerTextarea = document.querySelector('#new-answer');

    const emptyQuestionMessage = document.querySelector('.empty-question');
    const emptyAnswerMessage = document.querySelector('.empty-answer');

    // Clear error messages
    emptyQuestionMessage.innerText = '';
    emptyAnswerMessage.innerText = '';
    newQuestionTextarea.classList.remove('empty-field');
    newAnswerTextarea.classList.remove('empty-field');

    // Get values from inputs
    const newQuestion = newQuestionTextarea.value;
    const newAnswer = newAnswerTextarea.value;

    // Validate fields
    if (newQuestion === '') {
        newAnswerTextarea.classList.remove('empty-field');

        emptyQuestionMessage.classList.remove('hidden');
        newQuestionTextarea.classList.add('empty-field');
        emptyQuestionMessage.classList.add('error-message');
        emptyQuestionMessage.innerText = 'Question can not be empty. Please specify question.';

    } else if (newAnswer === '') {
        newQuestionTextarea.classList.remove('empty-field');

        emptyAnswerMessage.classList.remove('hidden');
        newAnswerTextarea.classList.add('empty-field');
        emptyAnswerMessage.classList.add('error-message');
        emptyAnswerMessage.innerText = 'Answer can not be empty. Please specify answer.';

    } else {
        // API call to server to create new flashcard
        fetch('/create-flashcard', {
            method: 'POST',
            body: JSON.stringify({
                "question": newQuestion,
                "answer": newAnswer,
                "stack": document.querySelector('.form-group').dataset.stack
            })
        })
            .then(response => response.json())
            .then(data => {

                // Clear and hide form
                document.querySelector('#new-question').value = '';
                document.querySelector('#new-answer').value = '';
                document.querySelector('#add-new-flashcard-form').style.display = 'none';

                const { id, question, answer } = data;
                renderNewFlashcard(id, question, answer);

                const currentFlashcard = document.querySelector('.question-in-stack[data-id]');
                showAlertSuccess(currentFlashcard, 'Flashcard was created.');

                const editBtn = currentFlashcard.querySelector('.edit-flashcard-btn');
                const deleteBtn = currentFlashcard.querySelector('.fa-trash');

                editBtn.addEventListener('click', () => editFlashcard(currentFlashcard));
                deleteBtn.addEventListener('click', () => deleteFlashcard(currentFlashcard));
            })
    }
}


function renderNewFlashcard(id, question, answer) {
    document.querySelector('.question-list').insertAdjacentHTML('afterbegin', `
        <div data-id=${id} class="question-in-stack">
        <div class="delete-icon"><i class="fa fa-trash" aria-hidden="true" data-toggle="modal" data-target="#deleteConfirmModal"></i></div>
        <div class="question-info">
            <div class="question-label bold">Question:</div>
            <div class="question">${question}</div>
            <div class="edited-question hidden">
                <textarea rows="3"></textarea>
                <div class="empty-edited-question hidden"></div>
            </div>
        </div>

        <div class="answer-info">
            <div class="answer-label bold">Answer:</div>
            <div class="answer">${answer}</div>
            <div class="edited-answer hidden">
                <textarea rows="3"></textarea>
                <div class="empty-edited-answer hidden"></div>
            </div>
        </div>

        <div class="edit-flashcard-btn-div">
            <button type="button" class="btn btn-outline-primary edit-flashcard-btn">Edit</button>
        </div>
        <div class="save-flashcard-btn-div hidden">
            <button type="button" class="btn btn-outline-primary save-flashcard-btn">Save</button>
        </div>
        </div>
        `
    )
}