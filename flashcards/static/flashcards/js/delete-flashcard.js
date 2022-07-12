import { showAlertSuccess } from './helpers.js';

export function deleteFlashcard(flashcard) {

    // Customize modal window to confirm deleting
    document.querySelector('.modal-body').innerHTML = `
            <p>Are you sure you want to delete the following question?</p>
            <p>${flashcard.querySelector('.question').innerText}</p>
            `;
    const confirmBtn = document.querySelector('.confirm-deletion');
    confirmBtn.onclick = removeCard;

    function removeCard() {
        fetch(`/delete-flashcard/${flashcard.dataset.id}`, {
            method: 'DELETE'
        })
            .then(data => {
                flashcard.style.display = 'none';
                showAlertSuccess(flashcard, 'Flashcard was deleted.');
            })
    }
}

