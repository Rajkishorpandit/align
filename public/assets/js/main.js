if (!IsAuthorized()) {
    location.href = 'index.html';
}

$(document).ready(function() {
    let firstName = localStorage.getItem('firstName');
    let lastName = localStorage.getItem('lastName');

    $('.lblusername').html(firstName + ' ' + lastName);
});

$('.logout').click(function() {
    Logout((result) => {
        location.href = 'index.html';
    });
});