import { showAlertSuccess } from './helpers.js';

export function shareStack(stack) {
    fetch(`/share-stack/${stack.dataset.id}`, {
        method: 'PUT'
    })
        .then(result => {
            if (result.error) {
                console.log(`Error: ${result.error}`);
            } else {
                stack.querySelector('.share-stack').disabled = true;
                const title = stack.querySelector('.stack-title').innerText;
                showAlertSuccess(stack, `Stack ${title} was shared.`);
            }
        })
}