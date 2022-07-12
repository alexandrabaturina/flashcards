import { deleteStack } from './delete-stack.js';
import { archiveStack } from './archive-stack.js';
import { shareStack } from './share-stack.js';
import { createStack } from './create-stack.js';

$(function () {
    $('[data-toggle="popover"]').popover()
})

document.addEventListener('DOMContentLoaded', function () {

    // Create stack
    document.querySelector('.create-new-stack').addEventListener('click', () => {
        createStack();
    })

    // Archive stack
    document.querySelectorAll('.archive-stack').forEach(btn => {
        btn.addEventListener('click', event => {
            const stack = event.target.closest('.user-stack');
            archiveStack(stack);
        })
    })

    // Share stack
    document.querySelectorAll('.share-stack').forEach(btn => {
        btn.addEventListener('click', event => {
            const stack = event.target.closest('.user-stack');
            shareStack(stack);
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
