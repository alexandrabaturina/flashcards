import { showAlertSuccess } from './helpers.js';

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.save-stack-btn').forEach(btn => {
        btn.addEventListener('click', event => {
            const stack = event.target.closest('.user-stack');

            // API call to server to save stack in user stacks
            fetch(`/save-stack/${stack.dataset.id}`, {
                method: 'POST'
            })
                .then(data => {
                    stack.querySelector('.save-stack-btn').disabled = true;
                    const title = stack.querySelector('.stack-title').innerText;
                    showAlertSuccess(stack, `Stack ${title} was saved.`);
                })
        })
    })
})