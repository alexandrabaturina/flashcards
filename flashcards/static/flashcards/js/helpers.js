function seconds(time) {
    return Math.round((time / 1000) % 60)
}

function minutes(time) {
    return Math.round((time / (1000 * 60) % 60))
}

function hours(time) {
    return Math.round((time / (1000 * 60 * 60) % 24))
}

export function formatTime(time) {

    if (time < 60000) {
        return `${Math.round((time / 1000) % 60)} s`
    } else if (60000 < time && time < 3600000) {
        return `${minutes(time)} min ${seconds(time)} s`
    } else {
        return `${hours(time)} h ${minutes(time)} min ${seconds(time)} s`
    }
}

export function sum(obj) {
    return Object.keys(obj).reduce((sum, key) => sum + parseInt(obj[key] || 0), 0);
}

export function showAlertSuccess(object, msg) {

    const alertID = Date.now;
    object.insertAdjacentHTML('beforebegin', `
    <div class="alert alert-success" role="alert" id="${alertID}">
        ${msg}
    </div>
    `);

    setTimeout(() => {
        document.getElementById(`${alertID}`).remove();
    }, 1500);
}

export function showErrorAlert(object, msg) {

    const alertID = Date.now;
    object.insertAdjacentHTML('afterend', `
    <div class="alert alert-danger alert-dismissible fade show" role="alert" id="${alertID}">
        ${msg}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
    `);
}


