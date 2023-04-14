module.exports.getdate = getdate;

function getdate() {
    var today = new Date();
    var options = {
        year: "numeric",
        month: "long",
        day: "numeric"
    }
    return today.toLocaleDateString("en-US", options);
}

module.exports.getHeading = function () {

    var today = new Date();
    if (today.getDay() === 0 || today.getDay() === 6) {

        var headingLine = "hurray! It's a weekend!";

    } else {
        var headingLine = "Umm! It's a weekday!";

    }
    return headingLine;
}

