import { showAlertSuccess } from './helpers.js';

export function deleteStack(stack) {

    // Customize modal window to confirm stack deletion
    document.querySelector('.modal-body').innerHTML = `
        <p>Are you sure you want to delete the following stack?</p>
        <p>${stack.querySelector('.stack-title').innerText}</p>
        `;
    const confirmBtn = document.querySelector('.confirm-deletion');
    confirmBtn.onclick = removeStack;

    function removeStack() {
        fetch(`/delete-stack/${stack.dataset.id}`, {
            method: 'DELETE'
        })
            .then(result => {
                if (result.error) {
                    console.log(`Error: ${result.error}`);
                } else {
                    stack.style.display = 'none';
                    const title = stack.querySelector('.stack-title').querySelector('a')
                        .innerText;
                    showAlertSuccess(stack, `Stack ${title} was deleted.`);
                }
            })
    }
}