import { createFlashcard } from './create-flashcard.js';
import { editFlashcard } from './edit-flashcard.js';
import { deleteFlashcard } from './delete-flashcard.js';
import { showErrorAlert } from './helpers.js';


document.addEventListener('DOMContentLoaded', function () {
  // Edit stack header
  if (document.querySelector('.edit-title-icon')) {
    document.querySelector('.edit-title-icon').addEventListener('click', event => {
      const stack = event.target.closest('.stack-header-wrapper');
      showTitleEditForm(stack)
    })
  }

  // Show form to choose csv file
  if (document.querySelector('.download-from-file-btn')) {
    document.querySelector('.download-from-file-btn').addEventListener('click', () => {
      document.querySelector('.download-from-file').classList.remove('hidden');
      document.querySelector('#csv-file-form').classList.remove('hidden');

      // Close form when clicking Close button
      document.querySelector('.close-icon').addEventListener('click', () => {
        document.querySelector('.download-from-file').classList.add('hidden');
        document.querySelector('#csv-file-form').classList.add('hidden');
      })

      // Display chosen file name
      document.querySelector('#csv-file-form').addEventListener('change', () => {
        const filePath = document.querySelector('#csv-file-input').value;
        const fileName = filePath.slice(filePath.lastIndexOf("\\") + 1);

        document.querySelector('.custom-file-label').innerText = fileName;
      })
    })
  }

  // Show error when choosing file with wrong extension
  if (document.querySelector('.error-file-extension')) {
    if (document.querySelector('.error-file-extension').innerText !== '') {
      const msg = `Unable to create flashcards from selected file.
        Please choose file with <strong>CSV</strong> extension.`
      showErrorAlert(document.querySelector('.download-from-file-btn'), msg)
    }
  }

  // Show error reading csv file
  if (document.querySelector('.error-reading-csv')) {
    if (document.querySelector('.error-reading-csv').innerText !== '') {
      const msg = `Unable to create flashcards from selected file.
        Please make sure your file is <strong>formatted appropriately</strong>.`
      showErrorAlert(document.querySelector('.download-from-file-btn'), msg)
    }
  }

  // Show form to create new flashcard
  if (document.querySelector('.new-flashcard-btn')) {
    document.querySelector('.new-flashcard-btn').addEventListener('click', () => {
      const addNewFlashcardForm = document.querySelector('#add-new-flashcard-form');
      addNewFlashcardForm.style.display = 'block';

      // Close form to create new flashcard
      document.querySelector('.close-create-flashcard-icon').addEventListener('click', () => {
        addNewFlashcardForm.querySelector('#new-question').value = '';
        addNewFlashcardForm.querySelector('#new-answer').value = '';
        addNewFlashcardForm.style.display = 'none';
      })
    })
  }

  // Create new flashcard
  document.querySelector('.create-flashcard-btn').addEventListener('click', createFlashcard);

  // Edit flashcard
  document.querySelectorAll('.edit-flashcard-btn').forEach(button => {
    button.addEventListener('click', event =>
      editFlashcard(event.target.closest('.question-in-stack'))
    );
  });

  // Delete flashcard
  document.querySelectorAll('.fa-trash').forEach(button => {
    button.addEventListener('click', event => {
      const flashcard = event.target.closest('.question-in-stack');
      deleteFlashcard(flashcard);
    });
  });
});


function showTitleEditForm(stack) {

  const stackHeaderWrapper = document.querySelector('.stack-header-wrapper');
  const editTitleDiv = document.querySelector('.edit-title-div');
  const titleEditArea = document.querySelector('.title-edit-area');

  stackHeaderWrapper.classList.add('hidden');
  editTitleDiv.classList.remove('hidden');
  titleEditArea.value = stackHeaderWrapper.querySelector('h1').innerText;

  document.querySelector('.close-edit-area-icon').addEventListener('click', () => {
    stackHeaderWrapper.classList.remove('hidden');
    editTitleDiv.classList.add('hidden');
  });

  document.querySelector('.edit-title-btn').addEventListener('click', () => {
    const errorMessage = document.querySelector('.unable-to-rename');

    // Clear error message
    errorMessage.innerText = '';
    titleEditArea.classList.remove('empty-field');

    // Disable renaming with empty title
    if (titleEditArea.value === '') {
      errorMessage.classList.remove('hidden');
      errorMessage.classList.add('error-message');
      errorMessage.innerText = 'Unable to rename stack. Title can not be empty. Please specify title.'
      titleEditArea.classList.add('empty-field');
    } else {
      editStackTitle(stack.dataset.id, titleEditArea.value);
    }
  })
}


function editStackTitle(stackId, newTitle) {

  fetch(`/edit-stack/${stackId}`, {
    method: 'POST',
    body: JSON.stringify({
      "title": newTitle
    })
  })
    .then(response => response.json())
    .then(data => {
      document.querySelector('.edit-title-div').classList.add('hidden');
      document.querySelector('.stack-header-wrapper').classList.remove('hidden');
      document.querySelector('h1').innerText = data.title;
    })
}