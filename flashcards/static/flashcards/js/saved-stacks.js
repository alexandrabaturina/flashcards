import { deleteStack } from './delete-stack.js';
import { archiveStack } from './archive-stack.js';

$(function () {
    $('[data-toggle="popover"]').popover()
})

document.addEventListener('DOMContentLoaded', function () {
    // Delete stack
    document.querySelectorAll('.delete-stack').forEach(btn => {
        btn.addEventListener('click', event => {
            const stack = event.target.closest('.user-stack');
            deleteStack(stack);
        })
    })

    // Archive stack
    document.querySelectorAll('.archive-stack').forEach(btn => {
        btn.addEventListener('click', event => {
            const stack = event.target.closest('.user-stack');
            archiveStack(stack);
        })
    })
})