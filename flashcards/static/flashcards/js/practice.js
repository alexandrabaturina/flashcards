document.addEventListener('DOMContentLoaded', function () {

    const startPracticeBtn = document.querySelector('.start-practice');
    startPracticeBtn.addEventListener('click', () => {

        startPracticeBtn.classList.add('hidden');

        // Get flashcards from server
        fetch(`/get-flashcards/${startPracticeBtn.dataset.id}`, {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                const flashcards = JSON.parse(data);
                const shuffledCards = shuffleFlashcards(flashcards);
                const totalCards = shuffledCards.length;
                const practiceArea = document.querySelector('.practice-area');
                const questionNumber = document.querySelector('.question-number');

                practiceArea.classList.remove('hidden');

                const startTime = Date.now();

                let index = 0;
                questionNumber.innerText = `Question 1 of ${totalCards}`;
                practiceArea.querySelector('.flashcard-question').innerText = shuffledCards[index].fields.question;

                document.querySelector('.next-button').addEventListener('click', event => {
                    event.preventDefault();
                    let userAnswer = document.getElementById('answer').value;

                    // Save user answer
                    shuffledCards[index]["fields"]["user-answer"] = userAnswer;

                    if (index < flashcards.length - 1) {
                        index++;
                        questionNumber.innerText = `Question ${index + 1} of ${totalCards}`;
                        practiceArea.querySelector('.flashcard-question').innerText = shuffledCards[index].fields.question;
                        // Clear answer field                        
                        document.getElementById('answer').value = '';
                    } else {
                        // Calculate practice time
                        const timeSpent = Date.now() - startTime;

                        practiceArea.classList.add('hidden');
                        document.querySelector('.results-table').classList.remove('hidden');

                        // Show practice report
                        const mobileView = window.matchMedia('(max-width: 640px)');
                        let tableString = `<table>`;

                        if (!mobileView.matches) {
                            tableString += `
                            <tr>
                                <th>Question</th>
                                <th>Your Answer</th>
                                <th>Correct Answer</th>
                            </tr>
                        `;
                        } else {
                            tableString += ``;
                        }

                        let correctAnswers = 0;
                        shuffledCards.forEach(card => {
                            const { question, answer, "user-answer": userAnswer } = card["fields"];
                            if (answer.toLowerCase() === userAnswer.toLowerCase()) {
                                correctAnswers++;
                            }

                            if (mobileView.matches) {
                                tableString += `
                                <tr>
                                    <th colspan="2">${question}</th>
                                </tr>
                                <tr>
                                    <th>Your Answer</th>
                                    ${answer.toLowerCase() === userAnswer.toLowerCase() ?
                                        ' <th class="correct-answer">' : '<th class="wrong-answer"> '}
                                        ${userAnswer}</th>
                                </tr>
                                <tr>
                                    <th>Correct Answer</th>
                                    <th>${answer}</th>
                                <tr>
                                    <th colspan="2"><hr/></th>
                                </tr>
                                `
                            } else {
                                tableString += `
                                <tr>
                                    <th>${question}</th>
                                    ${answer.toLowerCase() === userAnswer.toLowerCase() ?
                                        ' <th class="correct-answer">' : '<th class="wrong-answer"> '}
                                            ${userAnswer}</th>
                                    <th>${answer}</th>
                                </tr>
                                `
                            }
                        });
                        tableString += '</table >'
                        document.querySelector('.results-table').innerHTML = tableString += `</table > `;

                        // Save results to database
                        fetch(`/save-attempt/${startPracticeBtn.dataset.id}`, {
                            method: 'POST',
                            body: JSON.stringify({
                                "time": timeSpent,
                                "correct": correctAnswers,
                                "questions": shuffledCards.length
                            })
                        })
                            .then(result => {
                                if (result.error) {
                                    console.log(`Error: ${result.error}`);
                                } else {
                                    console.log('Attempt saved.');
                                };
                            })
                    }
                })
            })


        function shuffleFlashcards(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array
        }
    })
})