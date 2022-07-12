import { showAlertSuccess } from './helpers.js';
import { deleteStack } from './delete-stack.js';

document.addEventListener('DOMContentLoaded', function () {

    // Move stack back from archive
    document.querySelectorAll('.move-from-archive').forEach(btn => {
        btn.addEventListener('click', event => {

            const stack = event.target.closest('.user-stack');

            fetch(`/toggle-archived-flag/${stack.dataset.id}`, {
                method: 'PUT'
            })
                .then(result => {
                    if (result.error) {
                        console.log(`Error: ${result.error}`);
                    } else {
                        stack.style.display = 'none';
                        const title = stack.querySelector('a').innerText;
                        showAlertSuccess(stack,
                            `Stack ${title} was moved from archive.`);
                    }
                })
        })

        // Delete stack
        document.querySelectorAll('.delete-stack').forEach(btn => {
            btn.addEventListener('click', event => {
                const stack = event.target.closest('.user-stack');
                deleteStack(stack);
            })
        })
    })
})
