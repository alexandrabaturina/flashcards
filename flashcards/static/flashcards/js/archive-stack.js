import { showAlertSuccess } from './helpers.js';

export function archiveStack(stack) {
    fetch(`/toggle-archived-flag/${stack.dataset.id}`, {
        method: 'PUT'
    })
        .then(result => {
            if (result.error) {
                console.log(`Error: ${result.error}`);
            } else {
                stack.style.display = 'none';
                const title = stack.querySelector('.stack-title').querySelector('a')
                    .innerText;
                showAlertSuccess(stack, `Stack ${title} was archived.`);
            }
        })
}