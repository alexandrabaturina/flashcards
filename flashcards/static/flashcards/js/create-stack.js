export function createStack() {

    const userStacks = document.querySelector('.all-user-stacks');
    const createStackForm = document.querySelector('#create-stack-form');

    if (document.querySelector('.pagination')) {
        document.querySelector('.pagination').classList.add('hidden');
    }

    // Close Create New Stack form when clicking Close button
    document.querySelector('.close-create-stack-icon').addEventListener('click', () => {
        createStackForm.classList.add('hidden');
        userStacks.classList.remove('hidden');
    });

    createStackForm.classList.remove('hidden');
    userStacks.classList.add('hidden');
    document.querySelector('.create-stack-btn').addEventListener('click', event => {

        event.preventDefault();

        // Disable empty title
        if (document.querySelector('#stack-title').value === '') {
            const titleError = document.querySelector('.title-error');
            titleError.classList.remove('hidden');
            titleError.innerText = `Title can't be empty. Please specify title.`

            // Disable empty category
        } else if (document.querySelector('#stack-category').value === '') {
            const categoryError = document.querySelector('.category-error');
            categoryError.classList.remove('hidden');
            categoryError.innerText = `Category can't be empty. Please specify category.`
        } else {
            fetch('/new-stack', {
                method: 'POST',
                body: JSON.stringify({
                    "title": document.querySelector('#stack-title').value,
                    "category": document.querySelector('#stack-category').value
                })
            })
                .then(response => response.json())
                .then(data => {
                    // Redirect to stacks/stack_id page
                    window.location = `stacks/${data.stack_id}`
                })
        }
    })
}